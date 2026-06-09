#!/usr/bin/env python3
# Carte Gulf site generator — emits a single-page demo + a 6-page full site per restaurant.
import os

IMG = "https://images.unsplash.com/photo-{id}?q=80&w={w}&auto=format&fit=crop"
def img(i, w=800): return IMG.format(id=i, w=w)

# ---- restaurants -------------------------------------------------------------
R = [
 dict(slug="yasminepalace", name="Yasmine Palace", ar="قصر الياسمين",
   tag="Levantine & Qatari Cuisine · Doha", city="Doha", country="Qatar",
   cur="ر.ق", phone="+974 3325 4865", email="info@yasminepalace.com", ig="yasminepalace",
   web="https://yasminepalace.com/", addr="Porto Arabia, The Pearl, Doha", hours="Daily · 12:00 — 00:00",
   pal=dict(bg="#07160f",bg2="#0c2118",ink="#eef3ec",mut="#9db5a4",ac="#d4af37",ac2="#ecd98a",ln="rgba(212,175,55,.30)"),
   hf="Cormorant+Garamond:wght@500;600", hn="Cormorant Garamond", heroimg="1414235077428-338989a2e8c0",
   dishes=[("Mixed Grill","مشاوي مشكلة","Shish taouk, kofta, lamb, charcoal","1547573854-74d2a71d0826"),
           ("Machboos Laham","مجبوس لحم","Qatari spiced rice, lamb, loomi","1633945274405-b6c8069047b0"),
           ("Umm Ali","أم علي","Warm pastry pudding, nuts, cream","1565299624946-b28f40a0ae38")],
   menu=[("Cold Mezze","مقبلات باردة",[("Hummus & Meat","chickpeas, tahini, lamb","42"),("Tabbouleh","parsley, tomato, bulgur","32"),("Moutabal","smoked aubergine, tahini","30"),("Warak Enab","vine leaves, lemon","44")]),
         ("Charcoal","على الفحم",[("Mixed Grill","taouk, kofta, lamb cutlets","95"),("Shish Taouk","garlic, sumac chicken","62"),("Lamb Chops","za'atar, pomegranate","98"),("Grilled Hammour","Gulf fish, saffron rice","98")]),
         ("Gulf Pots","الطبخات",[("Machboos Laham","spiced rice, lamb, loomi","85"),("Madrouba","creamy rice, chicken","72"),("Saloona","Qatari stew, fish","78"),("Harees","wheat & lamb, ghee","58")]),
         ("Sweets","الحلويات",[("Umm Ali","pastry pudding, nuts","38"),("Knafeh","cheese, syrup, pistachio","40"),("Luqaimat","golden dumplings, date syrup","30"),("Arabic Coffee & Dates","cardamom coffee","22")])],
   story=["Yasmine Palace brings the grandeur of the Levantine and Gulf table to the heart of Doha — generous mezze, charcoal grills and Qatari pots served with palace hospitality.",
          "A setting of warmth and detail, where every guest is welcomed like family."]),
 dict(slug="karakhouse", name="Karak House", ar="بيت الكرك",
   tag="Karak Chai & Emirati Café · Downtown Dubai", city="Dubai", country="United Arab Emirates",
   cur="AED", phone="+971 4 551 6852", email="rmkarakhousedm@aaent.me", ig="karakhouse",
   web="#", addr="Mohammed Bin Rashid Blvd, Downtown Dubai", hours="Daily · from 07:00",
   pal=dict(bg="#14100b",bg2="#1f1810",ink="#f5ece0",mut="#bca987",ac="#d8973c",ac2="#edbd72",ln="rgba(216,151,60,.30)"),
   hf="Fraunces:opsz,wght@9..144,500;9..144,600", hn="Fraunces", heroimg="1564890369478-c89ca6d9cde9",
   dishes=[("Signature Karak","كرك","Slow-brewed spiced tea, cardamom","1564890369478-c89ca6d9cde9"),
           ("Cheese Honey Paratha","پراتا","Flaky paratha, cheese, honey","1565299624946-b28f40a0ae38"),
           ("Asida Waffles","وافل العصيدة","Crispy waffles, dates, molasses","1504754524776-8f4f37790ca0")],
   menu=[("Karak & Coffee","كرك وقهوة",[("Signature Karak Chai","cardamom, saffron, milk","18"),("Iced Caramel Karak","cold-brewed, caramel","24"),("Spanish Latte","condensed milk","16"),("Arabic Coffee","cardamom, dates","20")]),
         ("Breakfast","فطور",[("Cheese Honey Paratha","flaky paratha, cheese, honey","32"),("Asida Waffles","dates, molasses drizzle","38"),("Foul Medames","fava beans, olive oil","28"),("Balaleet","sweet saffron vermicelli","30")]),
         ("All Day","طوال اليوم",[("Avocado Toast","sourdough, dukkah, egg","42"),("French Toast","brioche, date syrup","36"),("Shakshuka","baked eggs, tomato","36"),("Chicken Machboos","spiced rice, loomi","52")]),
         ("Sweets","الحلويات",[("Luqaimat","golden dumplings, date syrup","26"),("Khabees","wheat, ghee, saffron","28"),("Date Cake","tahini, sea salt","24"),("Karak Cheesecake","spiced tea, biscuit","30")])],
   story=["Karak House is a homegrown Emirati café on the Boulevard, under the Burj Khalifa — built around the nation's favourite cup: slow-brewed karak chai, spiced and sweet.",
          "Warm colours, Arabic design and an open kitchen, where heritage flavours meet an all-day café menu."]),
 dict(slug="najdvillage", name="Najd Village", ar="القرية النجدية",
   tag="Traditional Saudi Cuisine · Riyadh", city="Riyadh", country="Saudi Arabia",
   cur="ر.س", phone="+966 92 003 3511", email="info@najdvillage.com", ig="najdvillagesa",
   web="https://najdvillage.com/", addr="Takhassusi Street, Riyadh", hours="Daily · 12:00 — 01:00",
   pal=dict(bg="#120c06",bg2="#1d140a",ink="#f6ecdd",mut="#c0a989",ac="#c98f3c",ac2="#e7b86a",ln="rgba(201,143,60,.30)"),
   hf="Aref+Ruqaa:wght@400;700", hn="Aref Ruqaa", heroimg="1543339308-43e59d6b73a6",
   dishes=[("Kabsa","كبسة","Spiced rice, lamb, dried lime","1633945274405-b6c8069047b0"),
           ("Jareesh","جريش","Crushed wheat, laban, onion","1547573854-74d2a71d0826"),
           ("Kleeja","كليجة","Date pastry, cardamom, cinnamon","1565299624946-b28f40a0ae38")],
   menu=[("Starters","المقبلات",[("Saudi Salad","tomato, cucumber, mint","28"),("Mutabbaq","stuffed pastry, meat","32"),("Foul","fava beans, olive oil","26"),("Tameez Bread","fresh clay-oven bread","18")]),
         ("From the Fire","من النار",[("Kabsa Laham","spiced rice, lamb, loomi","85"),("Mandi Chicken","smoked rice, free-range chicken","65"),("Mathloutha","rice, jareesh & hashw","78"),("Lamb Haneeth","slow-cooked lamb shoulder","95")]),
         ("Home Pots","الطبخات",[("Jareesh","crushed wheat, laban","55"),("Marqoog","dough, vegetable broth","58"),("Qursan","thin bread, stewed meat","60"),("Saleeg","creamy rice, chicken","62")]),
         ("Sweets","الحلويات",[("Kleeja","date pastry, cardamom","30"),("Masoub","banana, cream, honey","38"),("Areeka","date, ghee, honey","36"),("Saudi Coffee & Dates","cardamom coffee","22")])],
   story=["Since 1996, Najd Village has carried the table of central Arabia into Riyadh — recipes from the heart of Najd, served in a setting of mud-brick walls, palm beams and warm majlis hospitality.",
          "Everything is cooked the old way: slow fire, clay ovens, and the generosity that defines a Saudi welcome."]),

 dict(slug="maiz", name="Maiz", ar="ميز",
   tag="Saudi Fine Dining · Diriyah · Riyadh", city="Riyadh", country="Saudi Arabia",
   cur="ر.س", phone="+966 92 001 5513", email="reservations@maiz.sa", ig="maizriyadh",
   web="https://maiz.sa/", addr="Bujairi Terrace, Diriyah, Riyadh", hours="Daily · 12:00 — 01:00",
   pal=dict(bg="#0e0d0a",bg2="#17150f",ink="#f0ebe0",mut="#a8a090",ac="#b89a5e",ac2="#dcc28a",ln="rgba(184,154,94,.26)"),
   hf="Cormorant+Garamond:wght@500;600", hn="Cormorant Garamond", heroimg="1414235077428-338989a2e8c0",
   dishes=[("13 Regions Journey","رحلة المناطق","A tasting across Saudi Arabia","1633945274405-b6c8069047b0"),
           ("Najdi Lamb","لحم نجدي","Slow-cooked lamb, smoked rice","1535140728325-a4d3707eee61"),
           ("Date & Coffee","تمر وقهوة","Reimagined Saudi dessert","1565299624946-b28f40a0ae38")],
   menu=[("To Begin","البداية",[("Heritage Grains","13-region heirloom grains","65"),("Smoked Hummus","tahini, charcoal oil","55"),("Gulf Prawn","saffron, loomi butter","85"),("Tomato & Sumac","heritage tomato, herbs","52")]),
         ("Mains","الرئيسية",[("Najdi Lamb","slow-cooked, smoked rice","165"),("Hejazi Fish","red sea fish, sayadieh","145"),("Camel Tartare","modern Saudi plate","120"),("Madfoon","buried-style spiced rice","135")]),
         ("Tasting","التذوق",[("13 Regions Menu","chef's curated journey","450"),("Pairing","non-alcoholic pairing","180"),("","",""),("","","")]),
         ("Sweets","الحلويات",[("Date & Coffee","reimagined Saudi classic","58"),("Khabees Fondant","wheat, ghee, honey","56"),("Camel Milk Ice Cream","loomi caramel","48"),("Saudi Coffee Service","dates & sweets","40")])],
   story=["Maiz put Saudi fine dining on the world map — overlooking the UNESCO-listed At-Turaif in historic Diriyah, it journeys through the 13 regions of the Kingdom, with Najd at its heart.",
          "Heritage recipes meet modern technique: heirloom grains, dried lime, slow smoke — plated for today."]),

 dict(slug="mala", name="Mala", ar="مالا",
   tag="Modern Kuwaiti Cuisine · Kuwait City", city="Kuwait City", country="Kuwait",
   cur="د.ك", phone="+965 9807 3643", email="info@malakuwait.com", ig="mala.kuwait",
   web="https://www.malakuwait.com/", addr="Al Arjan Complex, Kuwait", hours="Daily · 12:00 — 00:00",
   pal=dict(bg="#0c0a0a",bg2="#171010",ink="#f4efe9",mut="#b29b92",ac="#c0392b",ac2="#e7a23c",ln="rgba(231,162,60,.26)"),
   hf="Fraunces:opsz,wght@9..144,500;9..144,600", hn="Fraunces", heroimg="1547573854-74d2a71d0826",
   dishes=[("Machboos Diyay","مجبوس دياي","Kuwaiti spiced rice, chicken","1633945274405-b6c8069047b0"),
           ("Murabyan","مربيان","Prawn & rice, bold spice","1519708227418-c8fd9a32b7a2"),
           ("Gers Ogaily","قرص عقيلي","Saffron & cardamom cake","1565299624946-b28f40a0ae38")],
   menu=[("Small Plates","أطباق صغيرة",[("Rangina","date, tahini, brown butter","28"),("Tashreeb","bread, broth, chickpeas","32"),("Jireesh","cracked wheat, tomato","30"),("Hummus Mala","tahini, spiced oil","26")]),
         ("Mains","الرئيسية",[("Machboos Diyay","spiced rice, chicken, loomi","58"),("Murabyan","prawn & rice, bzar spice","72"),("Mutabbaq Samak","fish & rice, caramel onion","68"),("Maraq Laham","lamb stew, vegetables","65")]),
         ("Bold & New","الجديد",[("Bzar Short Rib","Kuwaiti spice, slow-cooked","88"),("Loomi Chicken","dried-lime glaze","62"),("Saffron Saloona","modern stew","58"),("Chargrilled Hammour","tamarind, herbs","78")]),
         ("Sweets","الحلويات",[("Gers Ogaily","saffron cardamom cake","30"),("Khabees","wheat, ghee, saffron","28"),("Date Pudding","loomi caramel","32"),("Karak & Dates","spiced tea service","20")])],
   story=["Mala reimagines Kuwaiti cuisine for a new generation — the bold, aromatic flavours of the Gulf, plated with confidence and colour.",
          "Bzar spice, dried lime and saffron meet modern technique in a room that feels as young as the food."]),

 dict(slug="gastronomica", name="Gastronomica", ar="غاسترونوميكا",
   tag="All-Day Café & Kitchen · Kuwait", city="Kuwait", country="Kuwait",
   cur="د.ك", phone="+965 4954 3952", email="info@gastronomica-me.com", ig="gastronomicame",
   web="https://gastronomica-me.com/", addr="Crystal Tower, Sharq, Kuwait City", hours="Daily · 08:00 — 23:00",
   pal=dict(bg="#0f0f10",bg2="#18181a",ink="#f1efea",mut="#a3a09a",ac="#9c7a4d",ac2="#cda86f",ln="rgba(205,168,111,.24)"),
   hf="Cormorant+Garamond:wght@500;600", hn="Cormorant Garamond", heroimg="1542528180-1c2803fa048c",
   dishes=[("Specialty Coffee","قهوة مختصة","Single-origin, slow-poured","1564890369478-c89ca6d9cde9"),
           ("Brunch Plate","فطور","All-day eggs, greens, sourdough","1504754524776-8f4f37790ca0"),
           ("House Cake","كيك البيت","Daily-baked, seasonal","1565299624946-b28f40a0ae38")],
   menu=[("Coffee","قهوة",[("Filter / V60","single-origin, rotating","16"),("Flat White","double ristretto","14"),("Spanish Latte","condensed milk","15"),("Iced Shakerato","espresso, shaken","16")]),
         ("All-Day Brunch","فطور",[("Eggs Benedict","sourdough, hollandaise","42"),("Avocado Toast","dukkah, poached egg","38"),("Shakshuka","baked eggs, tomato, feta","36"),("Acai Bowl","fruit, granola, honey","34")]),
         ("Plates","أطباق",[("Truffle Pasta","wild mushroom, parmesan","58"),("Grilled Chicken","greens, lemon, herbs","52"),("Beef Slider Trio","brioche, aged cheddar","48"),("Garden Salad","seasonal, citrus dressing","36")]),
         ("Bakery","المخبوزات",[("Pistachio Cake","rose, cream","32"),("Basque Cheesecake","burnt top, vanilla","34"),("Cinnamon Roll","cream cheese glaze","26"),("Date Loaf","tahini, sea salt","24")])],
   story=["Gastronomica is a homegrown Kuwaiti café and kitchen — specialty coffee, all-day brunch and a bakery counter that has built a following across the city.",
          "A warm, design-led space where good coffee, good food and good company come together, every day."]),

 dict(slug="nooralsham", name="Noor Al Sham", ar="نور الشام",
   tag="Contemporary Levantine · DIFC, Dubai", city="Dubai", country="United Arab Emirates",
   cur="AED", phone="+971 4 000 0000", email="info@nooralsham.ae", ig="nooralsham",
   web="#", addr="DIFC, Dubai", hours="Daily · 12:00 — 00:00",
   pal=dict(bg="#0a0c14",bg2="#11141f",ink="#eef0f6",mut="#9aa0b8",ac="#c4a35a",ac2="#e6cf8e",ln="rgba(196,163,90,.26)"),
   hf="Cormorant+Garamond:wght@500;600", hn="Cormorant Garamond", heroimg="1600891964599-f61ba0e24092",
   dishes=[("Damascus to Beirut","دمشق إلى بيروت","12-course Levantine journey","1547573854-74d2a71d0826"),
           ("Cherry Kebab","كباب كرز","Aleppo cherry, lamb, pine nut","1535140728325-a4d3707eee61"),
           ("Halawet el Jibn","حلاوة الجبن","Sweet cheese roll, ashta","1565299624946-b28f40a0ae38")],
   menu=[("Mezze","مزة",[("Muhammara","red pepper, walnut, pomegranate","42"),("Smoked Mutabal","aubergine, tahini","38"),("Kibbeh Nayyeh","raw lamb, bulgur, spice","56"),("Shanklish","aged cheese, herbs","40")]),
         ("Charcoal","الفحم",[("Cherry Kebab","Aleppo cherry, lamb","78"),("Shish Taouk","garlic, sumac chicken","62"),("Lamb Chops","za'atar, pomegranate","98"),("Grilled Sea Bream","lemon, herbs","88")]),
         ("Tasting","التذوق",[("Damascus to Beirut","12-course journey","395"),("Heritage Grains","rare regional grains","52"),("","",""),("","","")]),
         ("Sweets","الحلويات",[("Halawet el Jibn","sweet cheese, ashta","44"),("Knafeh","cheese, syrup, pistachio","42"),("Mhalabiyeh","milk pudding, blossom","36"),("Arabic Coffee","cardamom, dates","26")])],
   story=["Noor Al Sham reimagines Levantine cuisine through a contemporary lens — a culinary journey from Damascus to Beirut, traced across an open kitchen in the heart of DIFC.",
          "Heritage grains and rare spice blends meet modern plating, course by course."]),

 dict(slug="bayteltalleh", name="Bayt El Talleh", ar="بيت الطلة",
   tag="Lebanese Home Cooking · Katara, Doha", city="Doha", country="Qatar",
   cur="ر.ق", phone="+974 4408 1777", email="info@bayteltalleh.qa", ig="bayt.eltalleh",
   web="https://akh.com.qa/brands/bayt-el-talleh/", addr="Katara Hills, Katara Cultural Village, Doha", hours="Daily · 09:00 — 23:30",
   pal=dict(bg="#120e0a",bg2="#1d1611",ink="#f3ece1",mut="#b6a48d",ac="#bd6b40",ac2="#d99463",ln="rgba(189,107,64,.30)"),
   hf="Cormorant+Garamond:wght@500;600", hn="Cormorant Garamond", heroimg="1432139509613-5c4255815697",
   dishes=[("Mixed Mezze","مزة مشكلة","A Lebanese table to share","1547573854-74d2a71d0826"),
           ("Charcoal Mishwi","مشاوي","Taouk, kafta, lamb on the coal","1535140728325-a4d3707eee61"),
           ("Knafeh","كنافة","Cheese, semolina, syrup","1565299624946-b28f40a0ae38")],
   menu=[("Cold Mezze","مقبلات باردة",[("Hummus","chickpea, tahini, olive oil","30"),("Tabbouleh","parsley, tomato, bulgur","32"),("Moutabal","smoked aubergine, tahini","30"),("Warak Enab","vine leaves, lemon","38")]),
         ("Hot Mezze","مقبلات ساخنة",[("Kibbeh","bulgur, lamb, pine nut","42"),("Rakakat","cheese rolls, mint","34"),("Sujuk","spiced sausage, lemon","40"),("Falafel","herb falafel, tahini","28")]),
         ("Charcoal","على الفحم",[("Shish Taouk","garlic chicken skewers","58"),("Lamb Kafta","parsley, onion, spice","60"),("Mixed Grill","taouk, kafta, cutlets","92"),("Grilled Sultan Ibrahim","red mullet, lemon","85")]),
         ("Sweets","الحلويات",[("Knafeh","cheese, semolina, syrup","36"),("Aish el Saraya","rose cream, syrup bread","34"),("Mhalabiyeh","milk pudding, pistachio","30"),("Lebanese Coffee","cardamom, sweets","22")])],
   story=["Bayt El Talleh — 'the house on the hill' — brings the Lebanese family table to Katara: homestyle mezze, charcoal mishwi and warm hospitality served the way it should be.",
          "Curated set menus, generous platters and the easy generosity of a Beirut home."]),
]

# ---- templates ---------------------------------------------------------------
def gfonts(hf):
    return ("https://fonts.googleapis.com/css2?family=" + hf +
            "&family=Inter:wght@300;400;500&family=Tajawal:wght@400;700&display=swap")

ICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>"
        "<rect width='48' height='48' rx='11' fill='%23{bg}'/><circle cx='24' cy='24' r='15' fill='none' "
        "stroke='%23{ac}' stroke-width='2'/><text x='24' y='31' font-family='Georgia' font-size='18' "
        "fill='%23{ac2}' text-anchor='middle'>{L}</text></svg>")

def head(r, title, desc):
    p=r['pal']
    return f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="icon" href="{ICON.format(bg=p['bg'][1:], ac=p['ac'][1:], ac2=p['ac2'][1:], L=r['name'][0])}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{gfonts(r['hf'])}" rel="stylesheet">"""

def css(r, full=False):
    p=r['pal']
    base=f""":root{{--bg:{p['bg']};--bg2:{p['bg2']};--ink:{p['ink']};--mut:{p['mut']};--ac:{p['ac']};--ac2:{p['ac2']};--ln:{p['ln']};
  --serif:'{r['hn']}',Georgia,serif;--sans:'Inter',system-ui,sans-serif;--ar:'Tajawal',sans-serif}}
*{{margin:0;padding:0;box-sizing:border-box}}html{{scroll-behavior:smooth}}
body{{background:var(--bg);color:var(--ink);font-family:var(--sans);font-weight:300;overflow-x:hidden;-webkit-font-smoothing:antialiased}}
h1,h2,h3{{font-family:var(--serif);font-weight:600;line-height:1.08}}.ar{{font-family:var(--ar);direction:rtl}}
.wrap{{max-width:1120px;margin:0 auto;padding:0 24px}}
.eyebrow{{font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--ac);margin-bottom:16px}}
.pad{{padding:110px 0}}.pad-sm{{padding:78px 0}}.reveal{{opacity:0;transform:translateY(40px)}}
.center{{text-align:center}}.section-head{{text-align:center;margin-bottom:54px}}.section-head h2{{font-size:clamp(34px,6vw,58px)}}
.btn{{display:inline-block;border:1px solid var(--ac);color:var(--ac2);padding:14px 32px;border-radius:2px;text-decoration:none;font-size:13px;letter-spacing:.18em;text-transform:uppercase;transition:.3s;background:none;cursor:pointer}}
.btn:hover{{background:var(--ac);color:var(--bg)}}.btn-solid{{background:var(--ac);color:var(--bg)}}.btn-solid:hover{{background:var(--ac2)}}
nav{{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:15px 28px;border-bottom:1px solid transparent;transition:.4s}}
nav.solid{{background:var(--bg);backdrop-filter:blur(10px);border-bottom:1px solid var(--ln)}}
.brand{{font-family:var(--serif);font-size:24px;color:var(--ac2);text-decoration:none}}
.navtoggle{{display:none;background:none;border:none;color:var(--ink);font-size:24px;cursor:pointer}}
.navlinks{{display:flex;gap:22px;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;align-items:center}}
.navlinks a{{color:var(--ink);text-decoration:none;opacity:.85}}.navlinks a:hover,.navlinks a.active{{opacity:1;color:var(--ac2)}}
.book-sm{{border:1px solid var(--ac);color:var(--ac2)!important;padding:9px 16px}}
@media(max-width:860px){{.navtoggle{{display:block}}.navlinks{{position:fixed;inset:0 0 0 auto;width:74%;max-width:320px;flex-direction:column;justify-content:center;gap:26px;background:var(--bg);transform:translateX(100%);transition:transform .4s;font-size:15px}}.navlinks.open{{transform:translateX(0)}}}}
.hero{{height:100svh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;position:relative}}
.hero-bg{{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.08)}}
.curtain{{position:absolute;top:0;bottom:0;width:51%;background:linear-gradient(var(--bg2),var(--bg));z-index:5}}#cLeft{{left:0}}#cRight{{right:0}}
.hero-inner{{position:relative;z-index:6;padding:0 20px}}
.hero .ar-name{{font-size:clamp(32px,7vw,60px);color:var(--ac2);margin-bottom:8px}}
.hero h1{{font-size:clamp(44px,10vw,116px);color:var(--ink)}}
.tagline{{margin-top:16px;font-size:clamp(13px,2.2vw,18px);letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}}
.hero-cta{{margin-top:32px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap}}
.scroll-hint{{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:6;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--mut)}}
.phero{{height:60vh;min-height:400px;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}}
.phero-bg{{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.45)}}
.phero-in{{position:relative;z-index:2}}.phero h1{{font-size:clamp(38px,8vw,80px);color:var(--ac2)}}.phero p{{margin-top:12px;color:var(--ink);letter-spacing:.2em;text-transform:uppercase;font-size:12px}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}}@media(max-width:820px){{.split{{grid-template-columns:1fr;gap:34px}}}}
.split img{{width:100%;height:460px;object-fit:cover;border:1px solid var(--ln)}}.split h2{{font-size:clamp(30px,4.6vw,48px);margin-bottom:18px}}.split p{{color:var(--mut);margin-bottom:14px;font-size:16px;line-height:1.75}}
.stat-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;text-align:center}}@media(max-width:640px){{.stat-grid{{grid-template-columns:1fr}}}}
.stat .num{{font-family:var(--serif);font-size:54px;color:var(--ac2)}}.stat .lbl{{color:var(--mut);margin-top:6px;font-size:14px}}
.tilt-wrap{{perspective:1300px}}.tilt-row{{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}}@media(max-width:820px){{.tilt-row{{grid-template-columns:1fr}}}}
.tilt{{position:relative;transform-style:preserve-3d;border-radius:10px;overflow:hidden;border:1px solid var(--ln);background:var(--bg2);box-shadow:0 26px 50px rgba(0,0,0,.5);animation:f3d 6s ease-in-out infinite}}
@keyframes f3d{{0%,100%{{transform:rotateY(-11deg) rotateX(4deg)}}50%{{transform:rotateY(11deg) rotateX(-4deg)}}}}
.tilt-row .tilt:nth-child(2){{animation-delay:-2s}}.tilt-row .tilt:nth-child(3){{animation-delay:-4s}}
.tilt img{{width:100%;height:320px;object-fit:cover;display:block;filter:saturate(1.05) brightness(.92)}}
.tilt .body{{position:absolute;right:0;left:0;bottom:0;padding:24px;background:linear-gradient(transparent,rgba(0,0,0,.9));transform:translateZ(50px)}}
.tilt h3{{font-size:24px;color:var(--ac2)}}.tilt .ar-sub{{font-family:var(--ar);direction:rtl;color:var(--mut);font-size:16px;margin-top:2px}}.tilt p{{color:var(--mut);font-size:13.5px;margin-top:6px}}
.badge3d{{display:inline-block;margin-top:14px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ac);border:1px solid var(--ln);padding:6px 13px;border-radius:20px}}
.menu-cat{{margin-bottom:50px}}.menu-cat h3{{font-size:30px;color:var(--ac2);text-align:center;margin-bottom:6px}}.menu-cat .sub{{text-align:center;color:var(--mut);font-size:12px;letter-spacing:.08em;margin-bottom:24px}}
.menu-grid{{display:grid;grid-template-columns:1fr 1fr;gap:8px 60px;max-width:920px;margin:0 auto}}@media(max-width:720px){{.menu-grid{{grid-template-columns:1fr}}}}
.dish{{display:flex;justify-content:space-between;gap:16px;align-items:baseline;padding:13px 0;border-bottom:1px solid var(--ln)}}
.dish .d-name{{font-size:18px;font-family:var(--serif)}}.dish .d-desc{{display:block;font-size:13px;color:var(--mut);margin-top:3px}}.dish .d-price{{color:var(--ac2);font-size:17px;white-space:nowrap}}
.grid-gal{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}}@media(max-width:720px){{.grid-gal{{grid-template-columns:1fr 1fr}}}}
.grid-gal img{{width:100%;height:260px;object-fit:cover;border:1px solid var(--ln);transition:transform .5s}}.grid-gal img:hover{{transform:scale(1.03)}}.grid-gal .tall{{grid-row:span 2;height:auto}}
.info-grid{{display:grid;grid-template-columns:1fr 1fr;gap:50px}}@media(max-width:760px){{.info-grid{{grid-template-columns:1fr}}}}
.info-grid h3{{color:var(--ac2);font-size:24px;margin-bottom:6px}}.info-grid p{{color:var(--mut);font-size:16px;line-height:1.7;margin-bottom:18px}}.info-grid a{{color:var(--ac2);text-decoration:none}}
.map{{width:100%;height:340px;border:1px solid var(--ln);filter:grayscale(.4) contrast(1.1)}}
.band{{background:var(--bg2);border-top:1px solid var(--ln);border-bottom:1px solid var(--ln);text-align:center}}
footer{{border-top:1px solid var(--ln);padding:50px 0;color:var(--mut);font-size:14px}}
.foot-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}}@media(max-width:720px){{.foot-grid{{grid-template-columns:1fr;gap:18px;text-align:center}}}}
.foot-grid a,footer a{{color:var(--ac2);text-decoration:none}}.demo-note{{margin-top:24px;text-align:center;font-size:11.5px;color:var(--mut);opacity:.7}}
@media(prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}.reveal{{opacity:1!important;transform:none!important}}.curtain{{display:none}}}}"""
    return base

APP_JS = """const nav=document.getElementById('nav');addEventListener('scroll',()=>nav&&nav.classList.toggle('solid',scrollY>40));
const tg=document.getElementById('navtoggle'),nl=document.getElementById('navlinks');
if(tg&&nl){tg.addEventListener('click',()=>nl.classList.toggle('open'));nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nl.classList.remove('open')));}
if(window.gsap){gsap.registerPlugin(ScrollTrigger);
 const cl=document.getElementById('cLeft'),cr=document.getElementById('cRight');
 if(cl)gsap.to(cl,{xPercent:-100,ease:'power2.inOut',duration:1.4,delay:.2});if(cr)gsap.to(cr,{xPercent:100,ease:'power2.inOut',duration:1.4,delay:.2});
 gsap.utils.toArray('.reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%'}}));
 gsap.utils.toArray('.num').forEach(el=>{const e=+el.dataset.count;ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{gsap.to({v:0},{v:e,duration:1.6,onUpdate:function(){el.textContent=Math.round(this.targets()[0].v)}})}})});}"""

GSAP = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>')

def navhtml(r, active=None, full=True):
    home = "index.html" if full else "#top"
    links = [("Home","index.html"),("Menu","menu.html"),("Events","events.html"),("Our Story","about.html"),("Gallery","gallery.html"),("Visit","visit.html")]
    if not full:
        links = [("Dishes","#dishes"),("Menu","#menu"),("Visit","#visit")]
    def lk(t, href):
        cls = ' class="active"' if active == href else ''
        return '<a href="' + href + '"' + cls + '>' + t + '</a>'
    a = "".join(lk(t, href) for t, href in links)
    brand = f'<a class="brand" href="{home}">{r["name"]}</a>' if full else f'<div class="brand">{r["name"]}</div>'
    tog = '<button class="navtoggle" id="navtoggle" aria-label="Menu">&#9776;</button>' if full else ''
    return f'<nav id="nav">{brand}{tog}<div class="navlinks" id="navlinks">{a}<a class="book-sm" href="{r["web"]}" target="_blank" rel="noopener">Reserve</a></div></nav>'

def foot(r):
    return f"""<footer><div class="wrap"><div class="foot-grid">
<div><div class="brand" style="font-size:20px">{r['name']}</div><p style="margin-top:8px">{r['addr']}<br>{r['country']}</p></div>
<div><strong style="color:var(--ink);font-weight:500">Hours</strong><p style="margin-top:8px">{r['hours']}</p></div>
<div><strong style="color:var(--ink);font-weight:500">Contact</strong><p style="margin-top:8px"><a href="tel:{r['phone'].replace(' ','')}">{r['phone']}</a><br><a href="mailto:{r['email']}">{r['email']}</a><br><a href="https://instagram.com/{r['ig']}" target="_blank" rel="noopener">@{r['ig']}</a></p></div>
</div><p class="demo-note">Design concept by Carte — not the official {r['name']} website, not affiliated with or endorsed by the restaurant.</p></div></footer>"""

def dishcards(r):
    c=""
    for n,a,d,i in r['dishes']:
        c+=f'<div class="tilt"><img src="{img(i)}" alt=""><div class="body"><h3>{n}</h3><div class="ar-sub">{a}</div><p>{d}</p></div></div>'
    return f'<div class="tilt-wrap"><div class="tilt-row">{c}</div></div>'

def flatmenu(r, n=6):
    items=[]
    for cat,a,rows in r['menu']:
        for nm,d,p in rows:
            if nm: items.append((nm,d,p))
    items=items[:n]
    return "".join(f'<div class="dish reveal"><span><span class="d-name">{nm}</span><span class="d-desc">{d}</span></span><span class="d-price">{p}</span></div>' for nm,d,p in items)

def fullmenu(r):
    out=""
    for cat,a,rows in r['menu']:
        ds="".join(f'<div class="dish"><span><span class="d-name">{nm}</span><span class="d-desc">{d}</span></span><span class="d-price">{p}</span></div>' for nm,d,p in rows if nm)
        out+=f'<div class="menu-cat reveal"><h3>{cat}</h3><div class="sub ar">{a}</div><div class="menu-grid">{ds}</div></div>'
    return out

def gallery3(r):
    ids=['1559339352-11d035aa65de','1542528180-1c2803fa048c','1601050690597-df0568f70950']
    return "".join('<img class="reveal" src="'+img(i)+'" alt="">' for i in ids)

def gallery(r):
    ids=["1414235077428-338989a2e8c0","1547573854-74d2a71d0826","1633945274405-b6c8069047b0","1565299624946-b28f40a0ae38","1559339352-11d035aa65de","1542528180-1c2803fa048c","1601050690597-df0568f70950","1432139509613-5c4255815697"]
    tall={1,5}
    return "".join(f'<img class="reveal{" tall" if k in tall else ""}" src="{img(i)}" alt="">' for k,i in enumerate(ids))

# ---- emit demo ---------------------------------------------------------------
def demo(r):
    p=r['pal']
    h=head(r,f"{r['name']} · {r['tag']}",f"{r['name']} — {r['tag']}.")
    return f"""{h}{GSAP}<style>{css(r)}
.hero-bg{{background-image:linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.82)),url('{img(r['heroimg'],1600)}')}}
.stats{{background:var(--bg2);border-top:1px solid var(--ln);border-bottom:1px solid var(--ln)}}</style></head><body>
{navhtml(r,full=False)}
<section class="hero" id="top"><div class="hero-bg"></div><div class="curtain" id="cLeft"></div><div class="curtain" id="cRight"></div>
<div class="hero-inner"><div class="ar-name ar">{r['ar']}</div><h1>{r['name']}</h1><div class="tagline">{r['tag']}</div>
<div class="hero-cta"><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a><a class="btn" href="#dishes">Signature Dishes</a></div></div>
<div class="scroll-hint">Scroll</div></section>
<section class="pad" id="dishes"><div class="wrap"><div class="section-head reveal"><div class="eyebrow">Interactive · 3D</div><h2>Signature Dishes</h2><span class="badge3d">Rotating in 3D</span></div>{dishcards(r)}</div></section>
<section class="stats pad"><div class="wrap stat-grid">
<div class="stat reveal"><div class="num" data-count="{r['s1']}">0</div><div class="lbl">{r['l1']}</div></div>
<div class="stat reveal"><div class="num" data-count="{r['s2']}">0</div><div class="lbl">{r['l2']}</div></div>
<div class="stat reveal"><div class="num" data-count="{r['s3']}">0</div><div class="lbl">{r['l3']}</div></div></div></section>
<section class="pad" id="menu"><div class="wrap"><div class="section-head reveal"><div class="eyebrow">From the Table</div><h2>A Taste of the Menu</h2></div><div class="menu-grid">{flatmenu(r)}</div></div></section>
<section class="band pad" id="visit"><div class="wrap reveal"><div class="eyebrow center" style="text-align:center">Reservations</div><h2 style="font-size:clamp(30px,5vw,52px)">{r['cta']}</h2><p class="ar" style="color:var(--ac2);font-size:20px;margin:14px 0 26px">أهلاً وسهلاً</p><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div></section>
{foot(r)}<script>{APP_JS}</script></body></html>"""

# ---- emit full pages ---------------------------------------------------------
def page(r, name, body, active):
    h=head(r,f"{name} · {r['name']}",f"{r['name']} — {r['tag']}.")
    return f"""{h}<link rel="stylesheet" href="styles.css">{GSAP}</head><body>
{navhtml(r,active=active,full=True)}
{body}
{foot(r)}<script src="app.js"></script></body></html>"""

def full_index(r):
    body=f"""<section class="hero" id="top"><div class="hero-bg" style="background-image:linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.82)),url('{img(r['heroimg'],1600)}')"></div>
<div class="curtain" id="cLeft"></div><div class="curtain" id="cRight"></div>
<div class="hero-inner"><div class="ar-name ar">{r['ar']}</div><h1>{r['name']}</h1><div class="tagline">{r['tag']}</div>
<div class="hero-cta"><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a><a class="btn" href="menu.html">View the Menu</a></div></div><div class="scroll-hint">Scroll</div></section>
<section class="pad"><div class="wrap split"><div class="reveal"><div class="eyebrow">{r['ar']}</div><h2>{r['cta']}</h2><p>{r['story'][0]}</p><a class="btn" style="margin-top:24px" href="about.html">Our Story</a></div>
<img class="reveal" src="{img('1414235077428-338989a2e8c0',1100)}" alt=""></div></section>
<section class="pad" id="dishes"><div class="wrap"><div class="section-head reveal"><div class="eyebrow">Interactive · 3D</div><h2>Signature Dishes</h2><span class="badge3d">Rotating in 3D</span></div>{dishcards(r)}</div></section>
<section class="pad-sm" style="background:var(--bg2);border-top:1px solid var(--ln);border-bottom:1px solid var(--ln)"><div class="wrap"><div class="section-head reveal"><div class="eyebrow">From the Table</div><h2>A Taste of the Menu</h2></div><div class="menu-grid">{flatmenu(r,4)}</div><div class="center reveal" style="margin-top:40px"><a class="btn" href="menu.html">See the Full Menu</a></div></div></section>
<section class="pad"><div class="wrap"><div class="section-head reveal"><div class="eyebrow">The Experience</div><h2>Our Setting</h2></div><div class="grid-gal">{gallery3(r)}</div><div class="center reveal" style="margin-top:36px"><a class="btn" href="gallery.html">View Gallery</a></div></div></section>
<section class="band pad"><div class="wrap reveal"><h2 style="font-size:clamp(30px,5vw,52px)">{r['cta']}</h2><p class="ar" style="color:var(--ac2);font-size:20px;margin:14px 0 26px">أهلاً وسهلاً</p><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div></section>"""
    return page(r,"Home",body,"index.html")

def full_menu(r):
    body=f"""<section class="phero"><div class="phero-bg" style="background-image:url('{img(r['dishes'][0][3],1600)}')"></div><div class="phero-in"><h1>The Menu</h1><p>{r['tag']}</p></div></section>
<section class="pad"><div class="wrap">{fullmenu(r)}<div class="center reveal"><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div></div></section>"""
    return page(r,"Menu",body,"menu.html")

def full_about(r):
    body=f"""<section class="phero"><div class="phero-bg" style="background-image:url('{img('1414235077428-338989a2e8c0',1600)}')"></div><div class="phero-in"><h1>Our Story</h1><p>{r['ar']}</p></div></section>
<section class="pad"><div class="wrap split"><img class="reveal" src="{img('1601050690597-df0568f70950',1100)}" alt=""><div class="reveal"><div class="eyebrow">{r['ar']}</div><h2>{r['cta']}</h2><p>{r['story'][0]}</p><p>{r['story'][1]}</p></div></div></section>
<section class="pad-sm" style="background:var(--bg2);border-top:1px solid var(--ln);border-bottom:1px solid var(--ln)"><div class="wrap stat-grid">
<div class="stat reveal"><div class="num" data-count="{r['s1']}">0</div><div class="lbl">{r['l1']}</div></div>
<div class="stat reveal"><div class="num" data-count="{r['s2']}">0</div><div class="lbl">{r['l2']}</div></div>
<div class="stat reveal"><div class="num" data-count="{r['s3']}">0</div><div class="lbl">{r['l3']}</div></div></div></section>
<section class="band pad"><div class="wrap reveal"><h2 style="font-size:clamp(30px,5vw,52px)">{r['cta']}</h2><a class="btn btn-solid" style="margin-top:22px" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div></section>"""
    return page(r,"Our Story",body,"about.html")

def full_events(r):
    body=f"""<section class="phero"><div class="phero-bg" style="background-image:url('{img('1600891964599-f61ba0e24092',1600)}')"></div><div class="phero-in"><h1>Events</h1><p>Private dining &amp; celebrations</p></div></section>
<section class="pad"><div class="wrap split"><div class="reveal"><div class="eyebrow">Private Dining</div><h2>Gatherings &amp; celebrations</h2><p>From family gatherings to milestone celebrations, {r['name']} hosts your occasion with bespoke set menus and warm Gulf hospitality.</p><p>Our team will tailor the experience to your guests, from intimate dinners to full venue events.</p><a class="btn" style="margin-top:24px" href="visit.html">Enquire &amp; Visit</a></div><img class="reveal" src="{img('1559339352-11d035aa65de',1100)}" alt=""></div></section>
<section class="band pad"><div class="wrap reveal"><h2 style="font-size:clamp(30px,5vw,52px)">Plan your event</h2><p style="color:var(--mut);max-width:560px;margin:14px auto 24px">Tell us your date and guest count — we'll craft the menu.</p><a class="btn btn-solid" href="mailto:{r['email']}?subject=Private%20event%20enquiry">Email Us</a></div></section>"""
    return page(r,"Events",body,"events.html")

def full_gallery(r):
    body=f"""<section class="phero"><div class="phero-bg" style="background-image:url('{img(r['dishes'][1][3],1600)}')"></div><div class="phero-in"><h1>Gallery</h1><p>Dishes &amp; setting</p></div></section>
<section class="pad"><div class="wrap"><div class="grid-gal">{gallery(r)}</div><div class="center reveal" style="margin-top:40px"><a class="btn btn-solid" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div></div></section>"""
    return page(r,"Gallery",body,"gallery.html")

def full_visit(r):
    q=r['name'].replace(' ','%20')+"%20"+r['city'].replace(' ','%20')
    body=f"""<section class="phero"><div class="phero-bg" style="background-image:url('{img('1559339352-11d035aa65de',1600)}')"></div><div class="phero-in"><h1>Visit Us</h1><p>{r['city']}</p></div></section>
<section class="pad"><div class="wrap"><div class="info-grid"><div class="reveal">
<h3>Find us</h3><p>{r['addr']}<br>{r['country']}</p>
<h3>Opening hours</h3><p>{r['hours']}</p>
<h3>Contact &amp; reservations</h3><p><a href="tel:{r['phone'].replace(' ','')}">{r['phone']}</a><br><a href="mailto:{r['email']}">{r['email']}</a><br><a href="https://instagram.com/{r['ig']}" target="_blank" rel="noopener">@{r['ig']}</a></p>
<a class="btn btn-solid" style="margin-top:10px" href="{r['web']}" target="_blank" rel="noopener">Reserve a Table</a></div>
<div class="reveal"><iframe class="map" title="{r['name']} location" loading="lazy" allowfullscreen src="https://www.google.com/maps?q={q}&output=embed"></iframe></div></div></div></section>"""
    return page(r,"Visit",body,"visit.html")

# ---- defaults for stats/cta --------------------------------------------------
DEF=dict(s1=20,l1="Years of hospitality",s2=48,l2="Dishes on the menu",s3=120,l3="Seats & majlis",cta="Join us at our table")
for r in R:
    for k,v in DEF.items(): r.setdefault(k,v)

# per-restaurant stat tweaks
stat_over={"karakhouse":(12,"Karak flavours",1,"Burj Khalifa view",7,"Open from 7am"),
 "najdvillage":(28,"Years of heritage",46,"Saudi dishes",150,"Seats in the village"),
 "maiz":(13,"Regions of Saudi",1,"UNESCO Diriyah",60,"Seats overlooking At-Turaif"),
 "mala":(7,"Years, reimagined",40,"Modern Kuwaiti dishes",80,"Seats in the room"),
 "gastronomica":(5,"Kuwait locations",12,"Specialty coffees",90,"Seats per cafe"),
 "nooralsham":(12,"Course journey",2,"Capitals on a plate",70,"Seats in DIFC"),
 "bayteltalleh":(15,"Years of Lebanese table",48,"Mezze & mishwi",110,"Seats at Katara")}
cta_over={"karakhouse":"On the Boulevard, under the Burj","najdvillage":"Half the Kingdom on one table","maiz":"A journey through Saudi Arabia","mala":"Kuwaiti flavour, reimagined","gastronomica":"Good coffee, all day","nooralsham":"From Damascus to Beirut","bayteltalleh":"The Lebanese table, in Doha"}
for r in R:
    if r['slug'] in stat_over:
        s=stat_over[r['slug']]; r['s1'],r['l1'],r['s2'],r['l2'],r['s3'],r['l3']=s
    if r['slug'] in cta_over: r['cta']=cta_over[r['slug']]

# ---- write -------------------------------------------------------------------
base="/home/daytona/project"
for r in R:
    open(f"{base}/demo-{r['slug']}.html","w").write(demo(r))
    d=f"{base}/{r['slug']}-full"; os.makedirs(d,exist_ok=True)
    open(f"{d}/styles.css","w").write(css(r,full=True))
    open(f"{d}/app.js","w").write(APP_JS)
    open(f"{d}/index.html","w").write(full_index(r))
    open(f"{d}/menu.html","w").write(full_menu(r))
    open(f"{d}/about.html","w").write(full_about(r))
    open(f"{d}/events.html","w").write(full_events(r))
    open(f"{d}/gallery.html","w").write(full_gallery(r))
    open(f"{d}/visit.html","w").write(full_visit(r))
    print("built", r['slug'])
print("DONE")
