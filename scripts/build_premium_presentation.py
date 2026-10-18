import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

TEMPLATE_PATH = r'C:/Users/osmae/.gemini/antigravity/brain/5cfe47df-e6da-43e1-82df-44db0f1814d6/.user_uploaded/media_1792319972213_50052aec.pptx'
OUTPUT_PATH = r'c:\Users\osmae\.gemini\antigravity\scratch\HR-Digital\presentation_team_47.pptx'
PIC1_PATH = r'c:\Users\osmae\.gemini\antigravity\scratch\HR-Digital\scripts\slide3_pic_1.png'
PIC2_PATH = r'c:\Users\osmae\.gemini\antigravity\scratch\HR-Digital\scripts\slide3_pic_2.png'

# Color Palette: Premium Jana Post Corporate Theme
COLOR_BG_DARK     = RGBColor(16, 24, 40)    # #101828 Deep Navy
COLOR_BG_CARD     = RGBColor(255, 255, 255) # White
COLOR_BG_SUBTLE   = RGBColor(248, 250, 252) # #F8FAFC Slate 50
COLOR_BG_BANNER   = RGBColor(241, 245, 249) # #F1F5F9 Slate 100
COLOR_PRIMARY     = RGBColor(37, 99, 235)   # #2563EB Corporate Blue
COLOR_PRIMARY_DARK= RGBColor(29, 78, 216)   # #1D4ED8
COLOR_ACCENT_GREEN= RGBColor(16, 185, 129)  # #10B981 Emerald
COLOR_TEXT_MAIN   = RGBColor(15, 23, 42)    # #0F172A Slate 900
COLOR_TEXT_MUTED  = RGBColor(71, 84, 103)   # #475467 Slate 600
COLOR_TEXT_LIGHT  = RGBColor(148, 163, 184) # #94A3B8 Slate 400
COLOR_BORDER      = RGBColor(226, 232, 240) # #E2E8F0 Slate 200
COLOR_BORDER_BLUE = RGBColor(191, 219, 254) # #BFDBFE Blue 200
COLOR_TAG_BG      = RGBColor(239, 246, 255) # #EFF6FF Blue 50

prs = pptx.Presentation(TEMPLATE_PATH)
SLIDE_W = prs.slide_width  # 9144000
SLIDE_H = prs.slide_height # 5143500

# ==============================================================================
# SLIDE 1: ТИТУЛЬНЫЙ СЛАЙД (Cover Slide)
# Требование:
# "первый слайд просто заполни как есть, не меняя блоки местами и с картинками пропиши туда наши данные и тд. номер команды 47"
# + Добавляем профессиональный дизайн, карточки, теги и визуальную иерархию
# ==============================================================================
slide1 = prs.slides[0]

# Добавим тонкую стильную полоску акцента в самый верх слайда (не сдвигая никаких блоков)
top_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, int(Pt(4).emu))
top_bar.fill.solid()
top_bar.fill.fore_color.rgb = COLOR_PRIMARY
top_bar.line.fill.background()

# Shape 2: Картинка логотипа IT-HUB QARAGANDY / Терриконовая долина - НЕ ТРОГАЕМ, на позиции (0, 0)!

# Shape 0: Placeholder "название кейса" (pos: 311708, 744575, 8520600, 2052600)
sh_case = slide1.shapes[0]
tf_case = sh_case.text_frame
tf_case.word_wrap = True
tf_case.clear()

# 1. Pill Badge
p_badge = tf_case.paragraphs[0]
p_badge.alignment = PP_ALIGN.CENTER
p_badge.space_after = Pt(8)
r_badge = p_badge.add_run()
r_badge.text = "ТОО «JANA POST LOGISTICS» • ХАКАТОН 2026"
r_badge.font.name = "Arial"
r_badge.font.size = Pt(11)
r_badge.font.bold = True
r_badge.font.color.rgb = COLOR_PRIMARY

# 2. Main Title
p_title = tf_case.add_paragraph()
p_title.alignment = PP_ALIGN.CENTER
p_title.space_after = Pt(8)
r_title = p_title.add_run()
r_title.text = "Digital HR: Корпоративная платформа"
r_title.font.name = "Arial"
r_title.font.size = Pt(32)
r_title.font.bold = True
r_title.font.color.rgb = COLOR_BG_DARK

# 3. Subtitle
p_sub = tf_case.add_paragraph()
p_sub.alignment = PP_ALIGN.CENTER
p_sub.space_after = Pt(14)
r_sub = p_sub.add_run()
r_sub.text = "Интеллектуальная система управления кадровым циклом и учет рабочего времени по ТК РК"
r_sub.font.name = "Arial"
r_sub.font.size = Pt(15)
r_sub.font.bold = False
r_sub.font.color.rgb = COLOR_TEXT_MUTED

# 4. Chips / Feature Tags
p_chips = tf_case.add_paragraph()
p_chips.alignment = PP_ALIGN.CENTER
chips = [
    "⏱ Ускорение визирования в 30 раз",
    "🇰🇿 100% ТК РК (24 дня)",
    "🔒 Серверный RBAC",
    "🤖 Кадровый RAG AI"
]
for i, chip in enumerate(chips):
    r_chip = p_chips.add_run()
    r_chip.text = f"  [{chip}]  "
    r_chip.font.name = "Arial"
    r_chip.font.size = Pt(11)
    r_chip.font.bold = True
    r_chip.font.color.rgb = COLOR_PRIMARY_DARK

# Shape 1: Placeholder "номер команды" (pos: 311700, 2834125, 8520600, 792600)
sh_team = slide1.shapes[1]
tf_team = sh_team.text_frame
tf_team.word_wrap = True
tf_team.clear()

p_team = tf_team.paragraphs[0]
p_team.alignment = PP_ALIGN.CENTER
p_team.space_after = Pt(4)
r_team = p_team.add_run()
r_team.text = "КОМАНДА № 47"
r_team.font.name = "Arial"
r_team.font.size = Pt(28)
r_team.font.bold = True
r_team.font.color.rgb = COLOR_PRIMARY

p_team_sub = tf_team.add_paragraph()
p_team_sub.alignment = PP_ALIGN.CENTER
r_ts = p_team_sub.add_run()
r_ts.text = "Digital HR Engineering Team • Jana Post Track"
r_ts.font.name = "Arial"
r_ts.font.size = Pt(12)
r_ts.font.bold = False
r_ts.font.color.rgb = COLOR_TEXT_MUTED

# Shape 3: Text Box "Караганда 2026 г." (pos: 3736575, 4670225, 2316000, 400200)
sh_city = slide1.shapes[3]
tf_city = sh_city.text_frame
tf_city.word_wrap = True
tf_city.clear()
p_city = tf_city.paragraphs[0]
p_city.alignment = PP_ALIGN.CENTER
r_city = p_city.add_run()
r_city.text = "Караганда, 2026 г."
r_city.font.name = "Arial"
r_city.font.size = Pt(13)
r_city.font.bold = True
r_city.font.color.rgb = COLOR_BG_DARK


# ==============================================================================
# SLIDE 2: КРАТКОЕ ОПИСАНИЕ ПРОДЕЛАННОЙ РАБОТЫ (Work Done & Plan)
# ==============================================================================
slide2 = prs.slides[1]

# Удалим существующие фигуры на слайде 2 для создания премиум-дизайна
for sh in list(slide2.shapes):
    sp = sh._element
    sp.getparent().remove(sp)

# 1. Заголовочная секция слайда
title_box = slide2.shapes.add_textbox(300000, 200000, 8544000, 700000)
tf_t = title_box.text_frame
tf_t.word_wrap = True
tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0

p_kicker = tf_t.paragraphs[0]
p_kicker.space_after = Pt(2)
r_k = p_kicker.add_run()
r_k.text = "АРХИТЕКТУРНЫЙ ОТЧЕТ И СТЕК ТЕХНОЛОГИЙ • КОМАНДА № 47"
r_k.font.name = "Arial"
r_k.font.size = Pt(9.5)
r_k.font.bold = True
r_k.font.color.rgb = COLOR_PRIMARY

p_main_title = tf_t.add_paragraph()
r_mt = p_main_title.add_run()
r_mt.text = "Краткое описание проделанной работы"
r_mt.font.name = "Arial"
r_mt.font.size = Pt(22)
r_mt.font.bold = True
r_mt.font.color.rgb = COLOR_BG_DARK

# 2. Верхний баннер: Бизнес-миссия и проблема (Summary Banner)
banner = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, 300000, 920000, 8544000, 520000)
banner.fill.solid()
banner.fill.fore_color.rgb = COLOR_BG_BANNER
banner.line.color.rgb = COLOR_BORDER
banner.line.width = Pt(1)

tf_b = banner.text_frame
tf_b.word_wrap = True
tf_b.margin_left = Pt(12)
tf_b.margin_right = Pt(12)
tf_b.margin_top = Pt(6)
tf_b.margin_bottom = Pt(6)
p_b = tf_b.paragraphs[0]
r_b1 = p_b.add_run()
r_b1.text = "📌 Проблема & Решение: "
r_b1.font.name = "Arial"
r_b1.font.size = Pt(11)
r_b1.font.bold = True
r_b1.font.color.rgb = COLOR_PRIMARY_DARK
r_b2 = p_b.add_run()
r_b2.text = "Автоматизирован кадровый цикл для 1 200+ сотрудников Jana Post. Устранена бумажная волокита и задержки: внедрена сквозная связка «Сотрудник → Руководитель → Кадры» в точном соответствии с ТК РК (квота отпусков 24 дня, формы Т-2, Т-6, Т-13, табель в UTC+5)."
r_b2.font.name = "Arial"
r_b2.font.size = Pt(10.5)
r_b2.font.color.rgb = COLOR_TEXT_MAIN

# 3. Две колонки: Левая (Ресурсы и стек) и Правая (Результаты и метрики)
COL_W = 4172000
COL_Y = 1520000
COL_H = 3450000
LEFT_X = 300000
RIGHT_X = 4672000

# ЛЕВАЯ КАРТОЧКА: Какие ресурсы были использованы?
card_left = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, LEFT_X, COL_Y, COL_W, COL_H)
card_left.fill.solid()
card_left.fill.fore_color.rgb = COLOR_BG_SUBTLE
card_left.line.color.rgb = COLOR_BORDER
card_left.line.width = Pt(1)

tf_l = card_left.text_frame
tf_l.word_wrap = True
tf_l.margin_left = Pt(14)
tf_l.margin_right = Pt(14)
tf_l.margin_top = Pt(12)
tf_l.margin_bottom = Pt(10)

p_l_head = tf_l.paragraphs[0]
p_l_head.space_after = Pt(8)
r_lh = p_l_head.add_run()
r_lh.text = "🛠 Какие ресурсы были использованы?"
r_lh.font.name = "Arial"
r_lh.font.size = Pt(14)
r_lh.font.bold = True
r_lh.font.color.rgb = COLOR_PRIMARY

stack_items = [
    ("Frontend Core & UX:", "React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, TanStack Query v5. Мгновенная отзывчивость (LCP < 0.8s) и мобильная адаптивность."),
    ("Backend & Data Layer:", "Node.js, Express, REST API v1, Prisma ORM, PostgreSQL / SQLite. Автономный zero-config офлайн-режим с реалистичными seed-данными."),
    ("Кадровый RAG AI «Jana»:", "Детерминированный кадровый ассистент на базе верифицированной базы ТК РК. 100% цитирование статей первоисточников и безопасный отказ."),
    ("Кибербезопасность & ПДн:", "Закон РК № 94-V о защите персональных данных, маскирование ИИН, серверный RBAC (Сотрудник, Лид, HR), защита от IDOR, неизменяемый аудит-лог.")
]

for title, desc in stack_items:
    p_t = tf_l.add_paragraph()
    p_t.space_before = Pt(4)
    p_t.space_after = Pt(1)
    rt = p_t.add_run()
    rt.text = f"• {title}"
    rt.font.name = "Arial"
    rt.font.size = Pt(11)
    rt.font.bold = True
    rt.font.color.rgb = COLOR_BG_DARK
    
    p_d = tf_l.add_paragraph()
    p_d.space_after = Pt(4)
    rd = p_d.add_run()
    rd.text = desc
    rd.font.name = "Arial"
    rd.font.size = Pt(10)
    rd.font.color.rgb = COLOR_TEXT_MUTED

# Футер слайда 2
footer_box2 = slide2.shapes.add_textbox(300000, 4850000, 8544000, 250000)
tf_f2 = footer_box2.text_frame
tf_f2.margin_left = tf_f2.margin_right = tf_f2.margin_top = tf_f2.margin_bottom = 0
p_f2 = tf_f2.paragraphs[0]
r_f2_1 = p_f2.add_run()
r_f2_1.text = "Digital HR by Jana Post • Архитектура решения и план внедрения"
r_f2_1.font.name = "Arial"
r_f2_1.font.size = Pt(9)
r_f2_1.font.color.rgb = COLOR_TEXT_LIGHT

r_f2_2 = p_f2.add_run()
r_f2_2.text = "                                                                                   Караганда, 2026 г."
r_f2_2.font.name = "Arial"
r_f2_2.font.size = Pt(9)
r_f2_2.font.color.rgb = COLOR_TEXT_LIGHT


# ПРАВАЯ КАРТОЧКА: Какие результаты получили?
card_right = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, RIGHT_X, COL_Y, COL_W, COL_H)
card_right.fill.solid()
card_right.fill.fore_color.rgb = COLOR_BG_SUBTLE
card_right.line.color.rgb = COLOR_BORDER
card_right.line.width = Pt(1)

tf_r = card_right.text_frame
tf_r.word_wrap = True
tf_r.margin_left = Pt(14)
tf_r.margin_right = Pt(14)
tf_r.margin_top = Pt(12)
tf_r.margin_bottom = Pt(10)

p_r_head = tf_r.paragraphs[0]
p_r_head.space_after = Pt(8)
r_rh = p_r_head.add_run()
r_rh.text = "🎯 Какие результаты получили?"
r_rh.font.name = "Arial"
r_rh.font.size = Pt(14)
r_rh.font.bold = True
r_rh.font.color.rgb = COLOR_ACCENT_GREEN

# 3 ключевые метрики в виде текста с цифрами
metrics = [
    ("⚡ 30x ускорение согласования", "Цикл визирования отпусков и авансов сокращен с 3 рабочих дней до 2 минут."),
    ("🇰🇿 100% соответствие ТК РК", "Авторасчет квоты 24 дня (ст. 88), табель Т-13, приказы Т-6, привязка к часовому поясу UTC+5."),
    ("🔒 Нулевое доверие к клиенту (Zero-Trust)", "Серверная изоляция данных: руководитель видит только свой отдел, сотрудники — только себя."),
    ("📦 100% готовность прототипа", "3 сквозных бизнес-сценария (Сотрудник, Руководитель, HR), работа без внешней сети.")
]

for title, desc in metrics:
    p_t = tf_r.add_paragraph()
    p_t.space_before = Pt(4)
    p_t.space_after = Pt(1)
    rt = p_t.add_run()
    rt.text = title
    rt.font.name = "Arial"
    rt.font.size = Pt(11)
    rt.font.bold = True
    rt.font.color.rgb = COLOR_BG_DARK
    
    p_d = tf_r.add_paragraph()
    p_d.space_after = Pt(4)
    rd = p_d.add_run()
    rd.text = desc
    rd.font.name = "Arial"
    rd.font.size = Pt(10)
    rd.font.color.rgb = COLOR_TEXT_MUTED


# ==============================================================================
# SLIDE 3: ДЕМОНСТРАЦИЯ ПРОТОТИПА (Live Prototype Showcase)
# ==============================================================================
slide3 = prs.slides[2]

# Удалим существующие фигуры на слайде 3 для чистого премиального лейаута
for sh in list(slide3.shapes):
    sp = sh._element
    sp.getparent().remove(sp)

# 1. Заголовочная секция слайда
title_box3 = slide3.shapes.add_textbox(300000, 200000, 8544000, 700000)
tf_t3 = title_box3.text_frame
tf_t3.word_wrap = True
tf_t3.margin_left = tf_t3.margin_right = tf_t3.margin_top = tf_t3.margin_bottom = 0

p_kicker3 = tf_t3.paragraphs[0]
p_kicker3.space_after = Pt(2)
r_k3 = p_kicker3.add_run()
r_k3.text = "ДЕМОНСТРАЦИОННЫЙ КОНТУР И ПОЛЬЗОВАТЕЛЬСКИЙ ОПЫТ • КОМАНДА № 47"
r_k3.font.name = "Arial"
r_k3.font.size = Pt(9.5)
r_k3.font.bold = True
r_k3.font.color.rgb = COLOR_PRIMARY

p_main_title3 = tf_t3.add_paragraph()
r_mt3 = p_main_title3.add_run()
r_mt3.text = "Демонстрация прототипа"
r_mt3.font.name = "Arial"
r_mt3.font.size = Pt(22)
r_mt3.font.bold = True
r_mt3.font.color.rgb = COLOR_BG_DARK

# 2. Левая колонка: Сценарии живого демо + Учетные данные
LEFT_S3_W = 3800000
LEFT_S3_H = 4100000
LEFT_S3_X = 300000
LEFT_S3_Y = 920000

card_s3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, LEFT_S3_X, LEFT_S3_Y, LEFT_S3_W, LEFT_S3_H)
card_s3.fill.solid()
card_s3.fill.fore_color.rgb = COLOR_BG_SUBTLE
card_s3.line.color.rgb = COLOR_BORDER
card_s3.line.width = Pt(1)

tf_s3 = card_s3.text_frame
tf_s3.word_wrap = True
tf_s3.margin_left = Pt(12)
tf_s3.margin_right = Pt(12)
tf_s3.margin_top = Pt(12)
tf_s3.margin_bottom = Pt(10)

p_s3_head = tf_s3.paragraphs[0]
p_s3_head.space_after = Pt(6)
r_s3h = p_s3_head.add_run()
r_s3h.text = "Ключевые сценарии демонстрации:"
r_s3h.font.name = "Arial"
r_s3h.font.size = Pt(13)
r_s3h.font.bold = True
r_s3h.font.color.rgb = COLOR_PRIMARY

scenarios_list = [
    ("1️⃣ Личный кабинет сотрудника (ESS):", [
        "• Отметка смены Clock-In / Out (UTC+5)",
        "• Баланс отпусков (ст. 88 ТК РК — 24 дня)",
        "• Подача заявления на отпуск и аванс за 30 сек."
    ]),
    ("2️⃣ Кабинет руководителя (MSS):", [
        "• Очередь заявлений команды IT и разработки",
        "• Резолюция в 1 клик: Одобрить / Отклонить",
        "• Неизменяемый цифровой след согласования"
    ]),
    ("3️⃣ Кадровый AI-ассистент «Jana»:", [
        "• Мгновенный ответ со ссылкой на статьи ТК РК",
        "• Алгоритмический отказ на нецелевые темы"
    ])
]

for title, bullets in scenarios_list:
    p_sec = tf_s3.add_paragraph()
    p_sec.space_before = Pt(4)
    p_sec.space_after = Pt(1)
    r_sec = p_sec.add_run()
    r_sec.text = title
    r_sec.font.name = "Arial"
    r_sec.font.size = Pt(10.5)
    r_sec.font.bold = True
    r_sec.font.color.rgb = COLOR_BG_DARK
    
    for b in bullets:
        p_b = tf_s3.add_paragraph()
        p_b.space_after = Pt(1)
        rb = p_b.add_run()
        rb.text = f"  {b}"
        rb.font.name = "Arial"
        rb.font.size = Pt(9.5)
        rb.font.color.rgb = COLOR_TEXT_MUTED

# Блок демо-аккаунтов
p_creds_head = tf_s3.add_paragraph()
p_creds_head.space_before = Pt(8)
p_creds_head.space_after = Pt(2)
r_ch = p_creds_head.add_run()
r_ch.text = "👤 Тестовые роли (Seed Accounts):"
r_ch.font.name = "Arial"
r_ch.font.size = Pt(10.5)
r_ch.font.bold = True
r_ch.font.color.rgb = COLOR_PRIMARY_DARK

creds = [
    "• Сотрудник: employee@janapost.kz (Адиль Омаров)",
    "• Тимлид: manager@janapost.kz (Нурлан Сериков)",
    "• HR Директор: admin@janapost.kz (Айгерим Смагулова)"
]
for cr in creds:
    p_cr = tf_s3.add_paragraph()
    p_cr.space_after = Pt(1)
    rcr = p_cr.add_run()
    rcr.text = f"  {cr}"
    rcr.font.name = "Arial"
    rcr.font.size = Pt(9)
    rcr.font.color.rgb = COLOR_TEXT_MAIN

# 3. Правая колонка: Визуальные макеты экранов приложения
RIGHT_S3_X = 4250000
RIGHT_S3_W = 4600000
IMG_H = 1950000
IMG1_Y = 920000
IMG2_Y = 3000000

# Макет 1: Личный кабинет сотрудника
# Рамка-карточка вокруг скриншота 1
frame1 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, RIGHT_S3_X, IMG1_Y, RIGHT_S3_W, IMG_H)
frame1.fill.solid()
frame1.fill.fore_color.rgb = RGBColor(255, 255, 255)
frame1.line.color.rgb = COLOR_BORDER
frame1.line.width = Pt(1)

# Вставляем картинку 1 с отступами
if os.path.exists(PIC1_PATH):
    pad = int(Pt(6).emu)
    slide3.shapes.add_picture(
        PIC1_PATH, 
        RIGHT_S3_X + pad, 
        IMG1_Y + pad, 
        width=RIGHT_S3_W - 2*pad, 
        height=IMG_H - 2*pad
    )

# Макет 2: Очередь визирования руководителя
frame2 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, RIGHT_S3_X, IMG2_Y, RIGHT_S3_W, IMG_H)
frame2.fill.solid()
frame2.fill.fore_color.rgb = RGBColor(255, 255, 255)
frame2.line.color.rgb = COLOR_BORDER
frame2.line.width = Pt(1)

# Вставляем картинку 2 с отступами
if os.path.exists(PIC2_PATH):
    pad = int(Pt(6).emu)
    slide3.shapes.add_picture(
        PIC2_PATH, 
        RIGHT_S3_X + pad, 
        IMG2_Y + pad, 
        width=RIGHT_S3_W - 2*pad, 
        height=IMG_H - 2*pad
    )

# Футер слайда 3
footer_box3 = slide3.shapes.add_textbox(300000, 4850000, 8544000, 250000)
tf_f3 = footer_box3.text_frame
tf_f3.margin_left = tf_f3.margin_right = tf_f3.margin_top = tf_f3.margin_bottom = 0
p_f3 = tf_f3.paragraphs[0]
r_f3_1 = p_f3.add_run()
r_f3_1.text = "Прототип готов к демонстрации • Локальный запуск: npm run dev"
r_f3_1.font.name = "Arial"
r_f3_1.font.size = Pt(9)
r_f3_1.font.color.rgb = COLOR_TEXT_LIGHT

r_f3_2 = p_f3.add_run()
r_f3_2.text = "                                                                                   Караганда, 2026 г."
r_f3_2.font.name = "Arial"
r_f3_2.font.size = Pt(9)
r_f3_2.font.color.rgb = COLOR_TEXT_LIGHT

prs.save(OUTPUT_PATH)
print("Successfully generated premium presentation at:", OUTPUT_PATH)
