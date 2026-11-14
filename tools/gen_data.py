# -*- coding: utf-8 -*-
"""Генерация js/data.js и assets/img/* из ресурсов MathBuilder.

Читает mtmml.xml активностей и все ImageAsset-описания, копирует
используемые картинки в assets/img и пишет карту refId -> путь.
"""
import os
import json
import shutil
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.normpath(os.path.join(HERE, '..'))
RES = os.path.normpath(os.path.join(WEB, '..', 'MathBuilder', 'AppResources'))
BASE = os.path.join(RES, 'activities')
IMAGES = os.path.join(RES, 'images')
OUT = os.path.join(WEB, 'js', 'data.js')
ASSETS = os.path.join(WEB, 'assets', 'img')


def parse_task(task_el):
    task = {"dialogue": None, "img": None, "answers": [], "overlay": []}
    db = task_el.find('DialogueBox')
    if db is not None:
        task["dialogue"] = int(db.get('textRefId')) if db.get('textRefId') else None
        task["img"] = int(db.get('imageRefId')) if db.get('imageRefId') else None

    for af in task_el.findall('AnswerField'):
        answer = []
        for child in af:
            tag = child.tag
            if tag == 'NumInputField':
                answer.append({"t": "input"})
            elif tag == 'TextLabelEntry':
                ref = child.get('textRefId')
                answer.append({"t": "label", "ref": int(ref) if ref else None})
            elif tag == 'Image':
                ref = child.get('imageRefId')
                answer.append({"t": "img", "ref": int(ref) if ref else None})
        if answer:
            task["answers"].append(answer)

    # Аннотации поверх сцены (позиции в долях от области сцены)
    for el in task_el:
        if el.tag == 'Image' and el.get('pos'):
            ref = el.get('imageRefId')
            pos = [float(v) for v in el.get('pos').split(',')]
            scale = [float(v) for v in (el.get('scale') or '0,0').split(',')]
            task["overlay"].append({"ref": int(ref) if ref else None,
                                    "pos": pos, "scale": scale})
    return task


def image_index():
    """refId -> абсолютный путь к png."""
    index = {}
    if not os.path.isdir(IMAGES):
        return index
    for root, _dirs, files in os.walk(IMAGES):
        for name in files:
            if not name.lower().endswith('.xml'):
                continue
            xml_path = os.path.join(root, name)
            png_path = os.path.splitext(xml_path)[0] + '.png'
            if not os.path.exists(png_path):
                continue
            try:
                tree = ET.parse(xml_path)
            except ET.ParseError:
                continue
            asset = tree.getroot().find('ImageAsset')
            if asset is None:
                continue
            ref = asset.get('refId')
            if ref is None:
                continue
            # Первое совпадение приоритетнее: картинки ответов/диалогов
            index.setdefault(int(ref), png_path)
    return index


def main():
    index = image_index()
    data = {}
    used = set()

    for act in range(1, 17):
        path = os.path.join(BASE, str(act), 'mtmml.xml')
        if not os.path.exists(path):
            continue
        tree = ET.parse(path)
        activity = tree.getroot().find('Activity')
        lessons = []
        for lesson_el in activity.findall('Lesson'):
            tasks = [parse_task(t) for t in lesson_el.findall('Task')]
            lessons.append({"tasks": tasks})
        meta = {
            "cover": int(activity.get('imageRefId')) if activity.get('imageRefId') else None,
            "lessons": lessons,
        }
        data[str(act)] = meta
        for lesson in lessons:
            for task in lesson["tasks"]:
                if task["img"] is not None:
                    used.add(task["img"])
                for group in task["answers"]:
                    for item in group:
                        if item.get("ref") is not None:
                            used.add(item["ref"])
                for ov in task["overlay"]:
                    if ov.get("ref") is not None:
                        used.add(ov["ref"])
        if meta["cover"] is not None:
            used.add(meta["cover"])

    # Копируем только используемые картинки
    os.makedirs(ASSETS, exist_ok=True)
    image_map = {}
    missing = []
    for ref in sorted(used):
        src = index.get(ref)
        if not src:
            missing.append(ref)
            continue
        name = 'img_%d.png' % ref
        dst = os.path.join(ASSETS, name)
        if (not os.path.exists(dst)) or os.path.getmtime(src) > os.path.getmtime(dst):
            shutil.copy2(src, dst)
        image_map[str(ref)] = 'assets/img/' + name

    js = "// Автоматически сгенерировано из mtmml.xml (tools/gen_data.py)\n"
    js += "window.MB_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    js += "window.MB_IMAGES = " + json.dumps(image_map, ensure_ascii=False, indent=1) + ";\n"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(js)

    total = sum(len(l['tasks']) for a in data.values() for l in a['lessons'])
    print("OK. Activities:", len(data), "Total tasks:", total)
    print("Images copied:", len(image_map), "Missing:", len(missing))
    if missing:
        print("Missing refs:", missing)
    print("Written:", OUT)


if __name__ == '__main__':
    main()
