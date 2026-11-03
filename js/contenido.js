/**
 * @file contenido.js
 * @description Fuente única de verdad (datos, textos en pantalla, guion B2 en inglés,
 * notas en español, tiempos asignados e IDs de RESEARCH_LEDGER.md) para la presentación
 * offline "Water, a Complex Web".
 *
 * REGLA DE TRAZABILIDAD: Toda cifra mostrada en pantalla proviene de este archivo y lleva
 * asociado su identificador `L-XX` con estado VERIFICADO o PARCIAL en RESEARCH_LEDGER.md.
 * Fecha de corte de datos: 2026-10-29. Fecha de exposición: 2026-11-19.
 */
(function () {
  "use strict";

  window.PRESENTATION_DATA = {
    meta: {
      title: "Our Water, Our Choices",
      subtitle: "Culture, Ecosystems, and Global Water Bankruptcy",
      course: "English B2 · Final Presentation",
      presentationDate: "2026-11-19",
      dataCutoff: "2026-10-29",
      totalDurationSeconds: 900,
      totalMainSlides: 12,
      thesis:
        "The water crisis is a crisis of the relationship between culture and ecosystems: it is one connected web, not separate problems."
    },

    theoryBadges: [
      {
        id: "opposites",
        symbol: "⇄",
        label: "Opposites",
        tooltip: "Dialogic principle (Morin): opposing realities coexist (water-rich yet vulnerable)."
      },
      {
        id: "loops",
        symbol: "↻",
        label: "Loops",
        tooltip: "Recursive principle (Morin): effects feed back and become new causes."
      },
      {
        id: "hologram",
        symbol: "◎",
        label: "Part = Whole",
        tooltip: "Hologrammatic principle (Morin): one country or glass reflects the whole global web."
      },
      {
        id: "uncertainty",
        symbol: "?",
        label: "Uncertainty",
        tooltip: "Scientific honesty (Morin): open data gaps and questions still under study."
      }
    ],

    /* =====================================================================
     * SLIDE 0 · GANCHO DE APERTURA (animación "mundo isométrico orgánico")
     * Se muestra mientras la estudiante hace la pregunta inicial. No lleva cifras:
     * las cifras llegan en las diapositivas 4 a 9 (ver GUION_ANIMACION.md).
     * ===================================================================== */
    introSlide: {
      id: 0,
      part: "Opening",
      title: "Where Does the Water Go?",
      theme: "light",
      layout: "intro-world",
      assignedSeconds: 40,
      cumulativeSeconds: 40,
      wordCount: 52,
      maxSteps: 0,
      stamp2026: null,
      activeBadges: [],
      culturalDecision: null,
      colombiaZoom: null,
      altText:
        "A wide block of land rises from the bottom of the slide: a snow-capped mountain with a páramo, a reservoir, farmland, a city with a factory and a data center, and the sea. Many drops of water travel at the same time through one connected cycle.",
      footerSources: "",
      ledgerIds: [],
      speaker: {
        propCue: "Utilería: ten el vaso de agua sobre la mesa; puedes tomar el sorbo en 'the glass of water you drank today'.",
        englishSteps: [
          "[Mientras la tierra sube.] Good morning. Think about the glass of water you drank today. [Aparecen las primeras gotas.] Where did it come from? [Muchas gotas se cruzan a la vez.] And where will it go next? It may cross a farm, a factory, a data center, a city… [El ciclo sigue sin parar.] Today I will show you that this journey is not a straight line. It is one connected web. [Pulsa → para ir a la diapositiva 1 y empieza en 'Our bodies are about sixty percent water'.]"
        ],
        spanishNotes:
          "Haz la pregunta mientras la animación corre: piensen en el vaso de agua de hoy, de dónde vino y a dónde irá. Menciona que puede pasar por un campo, una fábrica, un centro de datos y una ciudad, entre animales y comunidades, y que el recorrido no es una línea recta sino una red conectada. Al terminar, pulsa la flecha derecha. En la diapositiva 1 NO repitas el saludo ni la primera pregunta: arranca en 'Our bodies are about sixty percent water'.",
        pronunciation: [
          { word: "journey", ipa: "JUR-nee" },
          { word: "connected", ipa: "kuh-NEK-tid" },
          { word: "data center", ipa: "DAY-tuh SEN-ter" },
          { word: "straight", ipa: "STRAYT" }
        ],
        timeCuts: {
          ifLong: "Omite la lista 'a farm, a factory, a data center, a city' y pasa directo a 'this journey is not a straight line' (-12 palabras).",
          ifShort: "Pregunta antes: 'Raise your hand if you drank water this morning.' Deja que el bucle de la animación dé una segunda vuelta."
        }
      }
    },

    slides: [
      /* =====================================================================
       * SLIDE 1 · APERTURA
       * ===================================================================== */
      {
        id: 1,
        part: "Part I · Theoretical Lens",
        title: "No Water, No Plants, No People",
        theme: "dark",
        layout: "opening-circle",
        assignedSeconds: 45,
        cumulativeSeconds: 45,
        wordCount: 68,
        maxSteps: 3,
        stamp2026: null,
        activeBadges: [],
        livingCircleState: {
          mode: "hero",
          caption: "Intact vital triangle: Water → Plants & Algae → People"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "Diagram showing a human silhouette filled to 60 percent water connected in a living circle with plants and ocean algae producing at least 50 percent of Earth's oxygen.",
        visual: {
          bodyWaterPct: { value: "≈ 60%", label: "of the human body is water", detail: "Without water, we survive only a few days.", ledgerId: "L-01" },
          oceanOxygen: { value: "≥ 50%", label: "of Earth's oxygen comes from ocean plankton & algae", detail: "Water sustains land crops, forests, and marine photosynthesis.", ledgerId: "L-02" },
          circleRule: {
            headline: "One Living Circle",
            chain: "No Water → No Plants & Algae → No People",
            question: "What happens when our own habits break this circle?"
          }
        },
        footerSources: "Sources: USGS Water Science School (L-01); NOAA National Ocean Service, 2024 (L-02).",
        ledgerIds: ["L-01", "L-02"],
        speaker: {
          propCue: "Utilería física: sostén un vaso de agua real y toma un sorbo pequeño al iniciar.",
          englishSteps: [
            "Good morning. Let me start with one simple question: what keeps us alive right now?",
            "[Click 1] Our bodies are about sixty percent water; without it, we survive only a few days.",
            "[Click 2] Water also sustains plants and ocean algae, which produce our food and at least half of Earth's oxygen.",
            "[Click 3] Without water, there are no plants; without plants, no people. Today, let's see what happens when we break this circle."
          ],
          spanishNotes:
            "Levanta tu vaso de agua real. Di que nuestro cuerpo es casi 60% agua y que las plantas y algas marinas producen nuestra comida y al menos la mitad del oxígeno del planeta. Sin agua no hay plantas, y sin plantas no hay personas.",
          pronunciation: [
            { word: "algae", ipa: "AL-jee" },
            { word: "oxygen", ipa: "OK-si-jen" },
            { word: "survive", ipa: "sur-VYV" }
          ],
          timeCuts: {
            ifLong: "Omite 'without it, we survive only a few days' (-8 palabras).",
            ifShort: "Pregunta al abrir: 'Raise your hand if you drank water this morning.'"
          }
        }
      },

      /* =====================================================================
       * SLIDE 2 · COMPLEJIDAD (EDGAR MORIN)
       * ===================================================================== */
      {
        id: 2,
        part: "Part I · Theoretical Lens",
        title: "A Drying River: One Problem or Many?",
        theme: "light",
        layout: "drying-river",
        assignedSeconds: 75,
        cumulativeSeconds: 120,
        wordCount: 104,
        maxSteps: 3,
        stamp2026: null,
        activeBadges: ["opposites", "loops", "hologram", "uncertainty"],
        livingCircleState: {
          mode: "corner-threads",
          caption: "4 spheres (climate, farming, health, economy) pull on Water"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "A drying river connecting climate, farming, health, and economy simultaneously, introducing Edgar Morin's definition of complexus as woven together and four visual badges.",
        visual: {
          spheres: [
            { id: "climate", icon: "☀", title: "Climate?", effect: "Lower rainfall & river flow" },
            { id: "farming", icon: "✽", title: "Farming?", effect: "Crops fail without irrigation" },
            { id: "economy", icon: "◈", title: "Economy?", effect: "Food & treatment prices rise" },
            { id: "health", icon: "✚", title: "Health?", effect: "Concentrated dirty water sickens people" }
          ],
          allAtOnceBanner: "All four at the exact same time — water cannot be cut into separate boxes.",
          morinCard: {
            thinker: "Edgar Morin (1990 / 1999)",
            term: "Complexus = “Woven together”",
            explanation: "Traditional thinking cuts reality into isolated disciplines; complex thinking follows the threads connecting them.",
            ledgerId: "L-03"
          },
          badgeCards: [
            { symbol: "⇄", name: "Opposites", desc: "Abundance & scarcity coexist", ledgerId: "L-03" },
            { symbol: "↻", name: "Loops", desc: "Effects become new causes", ledgerId: "L-03" },
            { symbol: "◎", name: "Part = Whole", desc: "One basin mirrors the globe", ledgerId: "L-03" },
            { symbol: "?", name: "Uncertainty", desc: "Science admits open gaps", ledgerId: "L-04" }
          ]
        },
        footerSources:
          "Sources: Edgar Morin, Introduction to Complex Thought (Gedisa, 1994 [1990], L-03) & Seven Complex Lessons (UNESCO, 1999, L-04).",
        ledgerIds: ["L-03", "L-04"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Imagine a river drying up in Colombia today. Is that a climate problem? A farming problem? A health problem? Or an economic problem?",
            "[Click 1] Actually, it is all of them at the same time. When water drops, crops fail, prices rise, and dirty water makes people sick.",
            "[Click 2] The French thinker Edgar Morin explains why. The word complexity comes from complexus, which means 'woven together.' Usually, we cut reality into separate boxes, but water cannot be cut into pieces.",
            "[Click 3] Throughout this presentation, watch four badges on screen: opposites that coexist, loops where effects become new causes, one part that reflects the whole planet, and scientific uncertainty."
          ],
          spanishNotes:
            "Empieza por el ejemplo concreto antes de decir 'complejidad': un río seco golpea clima, cosechas, precios y salud a la vez. Luego presenta a Edgar Morin (complexus = tejido en conjunto) y señala las 4 insignias que se encenderán en las siguientes diapositivas.",
          pronunciation: [
            { word: "Morin", ipa: "mo-RAN" },
            { word: "complexus", ipa: "kom-PLEK-sus" },
            { word: "uncertainty", ipa: "un-SUR-ten-tee" }
          ],
          timeCuts: {
            ifLong: "Resume las 4 insignias en una frase corta: 'opposites, loops, part-and-whole, and uncertainty' (-12 palabras).",
            ifShort: "Añade un ejemplo de opuestos: 'Water gives life, yet polluted water spreads disease.'"
          }
        }
      },

      /* =====================================================================
       * SLIDE 3 · AUGUSTO ÁNGEL MAYA (NÚCLEO TEÓRICO Y TESIS)
       * ===================================================================== */
      {
        id: 3,
        part: "Part I · Theoretical Lens",
        title: "Augusto Ángel Maya: Culture & Ecosystems",
        theme: "dark",
        layout: "angel-maya-venn",
        assignedSeconds: 90,
        cumulativeSeconds: 210,
        wordCount: 120,
        maxSteps: 4,
        stamp2026: null,
        activeBadges: ["loops"],
        livingCircleState: {
          mode: "corner-culture",
          caption: "Culture (amber ring) mediates between People and Water"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "Venn diagram showing Natural Ecosystems intersecting with Human Culture as an adaptive platform to form the Environment, presenting the central thesis based on Augusto Ángel Maya.",
        visual: {
          leftCircle: {
            title: "Natural Ecosystems",
            subtitle: "Biophysical cycles & physical limits",
            items: ["Hydrological cycle", "Dilution & renewal capacity", "Living food webs"],
            ledgerId: "L-06"
          },
          rightCircle: {
            title: "Human Culture",
            subtitle: "Our Adaptive Platform (Ángel Maya)",
            items: ["Technology & infrastructure", "Economic & legal rules", "Values & daily consumption"],
            ledgerId: "L-05"
          },
          intersection: {
            title: "Environment = Ecosystem ∩ Culture",
            crisisNote: "Crisis emerges when cultural tools push ecosystems past their renewal limits — not nature alone, not society alone.",
            ledgerId: "L-06"
          },
          thesis:
            "“The water crisis is a crisis of the relationship between culture and ecosystems: it is one connected web, not separate problems.”",
          questionFlip: {
            oldQuestion: "Instead of only asking: “Where does water go?”",
            newQuestion: "Ask on every slide: “Which cultural decision caused this?”",
            ledgerId: "L-07"
          }
        },
        footerSources:
          "Sources: Augusto Ángel Maya, El reto de la vida: ecosistema y cultura (Ecofondo, 1996, pp. 26–30, 65, 79–86, L-05, L-06, L-07) & La fragilidad ambiental de la cultura (1995).",
        ledgerIds: ["L-05", "L-06", "L-07"],
        speaker: {
          propCue: null,
          englishSteps: [
            "To understand our role in that web, I use the ideas of the Colombian environmental thinker Augusto Ángel Maya.",
            "[Click 1] Most animals adapt to nature by changing their bodies over thousands of years. Humans adapt differently: we build culture. For Ángel Maya, culture is our adaptive platform—our tools, our economy, our laws, and our daily habits.",
            "[Click 2] What we call 'the environment' is the relationship between natural ecosystems and human culture. A problem appears when our cultural tools push ecosystems past their physical limits.",
            "[Click 3] So here is my thesis: the water crisis is a crisis of the relationship between culture and ecosystems: it is one connected web, not separate problems.",
            "[Click 4] From now on, every slide asks: which cultural decision caused this?"
          ],
          spanishNotes:
            "Explica en tus palabras a Augusto Ángel Maya: los animales evolucionan cambiando su cuerpo; nosotros nos adaptamos creando cultura (tecnología, leyes y hábitos). La crisis ambiental nace cuando esa plataforma cultural rebasa los límites físicos del ecosistema. Lee la tesis y lanza la pregunta guía.",
          pronunciation: [
            { word: "adaptive", ipa: "uh-DAP-tiv" },
            { word: "ecosystems", ipa: "EE-koh-sis-temz" },
            { word: "thesis", ipa: "THEE-sis" }
          ],
          timeCuts: {
            ifLong: "Acorta 'our tools, our economy, our laws, and our daily habits' a 'our technology and habits' (-6 palabras).",
            ifShort: "Añade su idea de la pág. 65: 'The goal is not leaving nature untouched, but learning to transform it well.'"
          }
        }
      },

      /* =====================================================================
       * SLIDE 4 · UN SISTEMA, DOS CARAS (BANCARROTA HÍDRICA + BUCLE)
       * ===================================================================== */
      {
        id: 4,
        part: "Part II · Global & Local Web",
        title: "One System, Two Faces: Global Water Bankruptcy",
        theme: "dark",
        layout: "two-faces-bankruptcy",
        assignedSeconds: 75,
        cumulativeSeconds: 285,
        wordCount: 109,
        maxSteps: 4,
        stamp2026: "JAN 2026",
        activeBadges: ["loops", "opposites"],
        livingCircleState: {
          mode: "corner-bankruptcy",
          caption: "Water node drops to 50%; scarcity ↻ pollution loop ignites"
        },
        culturalDecision: "Spending natural water savings (aquifers, lakes, wetlands) as if nature offered infinite credit.",
        colombiaZoom: {
          title: "Colombia Zoom · El Niño 2026–27",
          metric: "Low flow → higher concentration",
          detail: "Housing Ministry (May 2026) warned municipalities that drought lowers dilution capacity and raises potabilization costs.",
          ledgerIds: ["L-14"]
        },
        altText:
          "Two-sided diagram contrasting global water bankruptcy and declining aquifers on the left with 2.1 billion people lacking safe drinking water on the right, linked by a feedback loop showing river quality worsens in 68 percent of droughts.",
        visual: {
          bankruptcyBanner: {
            tag: "UNU-INWEH Report · Jan 20, 2026 (K. Madani)",
            label: "GLOBAL WATER BANKRUPTCY",
            definition: "Persistent extraction & pollution beyond natural renewal, causing irreversible or costly losses.",
            ledgerId: "L-09"
          },
          faceA: {
            title: "Face A · Availability & Natural Savings",
            stats: [
              { value: "~70%", text: "of major aquifers in long-term decline", ledgerId: "L-10" },
              { value: "~50%", text: "of large lakes lost water since early 1990s", ledgerId: "L-11" },
              { value: "~4B", text: "people face severe scarcity ≥ 1 month/year", ledgerId: "L-12" }
            ]
          },
          faceB: {
            title: "Face B · Safe Access & Water Quality",
            stats: [
              { value: "2.1B", text: "people lack safely managed drinking water (WHO/UNICEF JMP, Aug 2025)", ledgerId: "L-15" },
              { value: "3.4B", text: "people lack safely managed sanitation", ledgerId: "L-15" }
            ]
          },
          centralLoop: {
            stat: "68%",
            headline: "of studied droughts worsen river water quality",
            mechanism: "Less water flow ↻ Less dilution of waste ↻ Less usable clean water",
            sourceNote: "van Vliet et al., Nature Rev. Earth Environ. (2023)",
            ledgerId: "L-13"
          }
        },
        footerSources:
          "Sources: UNU-INWEH (Jan 2026, L-09..L-12); WHO/UNICEF JMP (Aug 2025, L-15); van Vliet et al., Nat. Rev. Earth Environ. (2023, L-13); MinVivienda Colombia (May 2026, L-14).",
        ledgerIds: ["L-09", "L-10", "L-11", "L-12", "L-13", "L-14", "L-15"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Scarcity and pollution are two faces of one system.",
            "[Click 1] In January 2026, a UN University report led by Kaveh Madani declared 'global water bankruptcy.' We spend natural water savings faster than rain renews them: about seventy percent of major aquifers are declining, and four billion people face severe scarcity at least one month a year.",
            "[Click 2] Meanwhile, 2.1 billion people lack safe drinking water.",
            "[Click 3] Here is our first loop: river studies show water quality worsens in sixty-eight percent of droughts, because low flows cannot dilute waste.",
            "[Click 4] Colombia's Housing Ministry warned of this exact loop during El Niño. Our cultural decision was spending water as if nature had infinite credit."
          ],
          spanishNotes:
            "Muestra las dos caras: en enero de 2026 la Universidad de la ONU declaró 'bancarrota hídrica' (~70% de grandes acuíferos bajando y ~4.000 millones con escasez severa). Al otro lado, 2.100 millones sin agua potable segura (OMS/UNICEF 2025). El bucle del centro los une: en 68% de las sequías empeora la calidad del río por menor dilución.",
          pronunciation: [
            { word: "bankruptcy", ipa: "BANK-rupt-see" },
            { word: "aquifers", ipa: "AK-wi-ferz" },
            { word: "scarcity", ipa: "SKAIR-si-tee" },
            { word: "dilute", ipa: "dy-LOOT" }
          ],
          timeCuts: {
            ifLong: "Omite 'led by Kaveh Madani' y 'and four billion people face severe scarcity at least one month a year' (-17 palabras).",
            ifShort: "Menciona también que cerca del 50% de los grandes lagos perdió agua desde los años 90 (L-11)."
          }
        }
      },

      /* =====================================================================
       * SLIDE 5 · HISTORIA (ACELERACIÓN SIGLO XX + MAR DE ARAL)
       * ===================================================================== */
      {
        id: 5,
        part: "Part II · Global & Local Web",
        title: "How We Got Here: Technology Moved Faster Than Rules",
        theme: "light",
        layout: "history-timeline",
        assignedSeconds: 75,
        cumulativeSeconds: 360,
        wordCount: 104,
        maxSteps: 4,
        stamp2026: null,
        activeBadges: ["loops"],
        livingCircleState: {
          mode: "corner-heavy-draw",
          caption: "20th-century extraction arrow thickens ×6 before rules react"
        },
        culturalDecision: "Scale extraction and synthetic chemicals first; pass water safeguards decades later.",
        colombiaZoom: {
          title: "Colombia Zoom · 2013–2014 Legal Reaction",
          metric: "Law 1658 (2013) & Bogotá River Ruling (2014)",
          detail: "Colombia banned mining mercury (deadline 2018) and ordered Bogotá River cleanup after decades of dumping.",
          ledgerIds: ["L-21", "L-22"]
        },
        altText:
          "Twentieth-century growth bars showing freshwater use growing 6 times, synthetic nitrogen growing from 11.3 to 107.6 teragrams, and plastics jumping from 2 million to over 400 million tons per year, paired with an interactive 1960 versus 2020s Aral Sea comparison slider.",
        visual: {
          growthBars: [
            {
              label: "Global freshwater use (20th century)",
              value: "≈ ×6",
              note: "Global pace slowed after 2000, while regional aquifer depletion deepened",
              fillPct: 68,
              colorClass: "bar-water",
              step: 1,
              ledgerId: "L-16"
            },
            {
              label: "Synthetic nitrogen fertilizer (1960 → 2013)",
              value: "11.3 → 107.6 Tg N/yr",
              note: "≈ 9.5× surge driving agricultural runoff & eutrophication",
              fillPct: 86,
              colorClass: "bar-amber",
              step: 2,
              ledgerId: "L-19"
            },
            {
              label: "Annual plastic production (1950 → 2015)",
              value: "2M → >400M t/yr",
              note: "8.3B metric tons cumulative by 2015 (~79% in landfills or nature)",
              fillPct: 98,
              colorClass: "bar-alert",
              step: 2,
              ledgerId: "L-18"
            }
          ],
          aralComparison: {
            title: "Aral Sea Basin · 1960 vs. 2020s",
            subtitle: "Amu Darya & Syr Darya diverted for desert cotton irrigation",
            lossLabel: "~2/3 to ~90% of water volume lost across 1960–2020s measurements",
            leftYear: "1960 · 4th largest lake",
            rightYear: "2020s · Fragmented basins",
            ledgerId: "L-20"
          },
          milestones: [
            { year: "1938 / 1950s", title: "PFAS commercialized", desc: "Used ~70 yrs before US/EU drinking-water limits", step: 2, ledgerId: "L-17" },
            { year: "1960s", title: "Aral Sea river diversion", desc: "Export cotton prioritized over living basin", step: 3, ledgerId: "L-20" },
            { year: "2013–2014", title: "Colombia Mercury Law & Bogotá River", desc: "Law 1658/2013 & Council of State Mar 2014 ruling", step: 4, ledgerId: "L-21" },
            { year: "Apr 2014", title: "Flint lead crisis", desc: "Skipped corrosion control to cut costs ($626.25M settlement, 2021)", step: 4, ledgerId: "L-23" }
          ]
        },
        footerSources:
          "Sources: UN WWDR (2021) & OWID (L-16); Lu & Tian, ESSD (2017, L-19); Geyer et al., Sci. Adv. (2017, L-18); ITRC (L-17); NASA (L-20); Ley 1658/2013 (L-21); Consejo de Estado (2014, L-22); E.D. Mich. (2021, L-23).",
        ledgerIds: ["L-16", "L-17", "L-18", "L-19", "L-20", "L-21", "L-22", "L-23"],
        speaker: {
          propCue: null,
          englishSteps: [
            "This bankruptcy did not happen overnight.",
            "[Click 1] In the twentieth century, global freshwater use grew about six times—though global growth slowed after 2000, regional depletion kept deepening.",
            "[Click 2] After 1950, our chemical platform exploded. Synthetic nitrogen fertilizers grew almost ten times from 1960 to 2013. Plastic production jumped from two million tons in 1950 to over four hundred million by 2015, while PFAS chemicals spread decades before drinking-water rules.",
            "[Click 3] In the 1960s, rivers feeding the Aral Sea were diverted for cotton.",
            "[Click 4] By 2013 and 2014, Flint suffered lead poisoning, while Colombia passed its Mercury Law and Bogotá River ruling. Production came first; protection came late."
          ],
          spanishNotes:
            "Recorre las 3 barras de aceleración del siglo XX (agua ×6, fertilizante nitrogenado casi ×10, plástico de 2 a >400 millones de toneladas anuales y PFAS sin reglas desde los años 50). Luego señala el deslizador del Mar de Aral y los hitos de 2013–2014 (Flint, mercurio y río Bogotá): produjimos rápido y regulamos décadas tarde.",
          pronunciation: [
            { word: "twentieth", ipa: "TWEN-tee-eth" },
            { word: "synthetic", ipa: "sin-THET-ik" },
            { word: "nitrogen", ipa: "NY-truh-jen" },
            { word: "diverted", ipa: "dy-VUR-tid" }
          ],
          timeCuts: {
            ifLong: "Omite 'though global growth slowed after 2000, regional depletion kept deepening' (-10 palabras).",
            ifShort: "Mueve el deslizador del Mar de Aral en vivo para mostrar cómo quedó partido."
          }
        }
      },

      /* =====================================================================
       * SLIDE 6 · PRODUCCIÓN Y ESTILO DE VIDA CONSUMISTA
       * ===================================================================== */
      {
        id: 6,
        part: "Part II · Global & Local Web",
        title: "Production & Consumer Lifestyle: One Connected Web",
        theme: "light",
        layout: "production-consumption-web",
        assignedSeconds: 90,
        cumulativeSeconds: 450,
        wordCount: 120,
        maxSteps: 4,
        stamp2026: null,
        activeBadges: ["loops", "uncertainty"],
        livingCircleState: {
          mode: "corner-consumption",
          caption: "Production & shopping habits draw water and return waste"
        },
        culturalDecision: "Fast-consumption habits hide virtual water extraction and downstream chemical waste behind low retail prices.",
        colombiaZoom: {
          title: "Colombia Zoom · CRA Household Benchmark",
          metric: "13 m³/mo basic · >22 m³/mo surcharge",
          detail: "Regulatory threshold in cold cities (>2,000 m, e.g. Bogotá) to discourage excessive domestic demand.",
          ledgerIds: ["L-31"]
        },
        altText:
          "Four-node network linking farm withdrawals at 72 percent, mining and industrial wastewater gaps, a 2,700-liter cotton T-shirt broken into blue, green, and grey water, and bottled water containing around 240,000 plastic particles per liter.",
        visual: {
          nodes: [
            {
              step: 1,
              tag: "Node 1 · Farms",
              icon: "✽",
              accent: "green",
              kpi: "~72%",
              kpiLabel: "of global freshwater withdrawals ( municipal ~12% )",
              bullets: [
                "Agricultural nitrate = most common chemical contaminant in groundwater aquifers globally."
              ],
              ledgerIds: ["L-24", "L-25"]
            },
            {
              step: 2,
              tag: "Node 2 · Mines & Industry",
              icon: "▲",
              accent: "alert",
              kpi: "~23.5M",
              kpiLabel: "people on floodplains polluted by metal mining (~16% withdrawals)",
              bullets: [
                "42% of household wastewater not safely treated (2022) · ? Industrial wastewater: global data insufficient."
              ],
              ledgerIds: ["L-24", "L-26", "L-27"]
            },
            {
              step: 3,
              tag: "Node 3 · Consumer Goods",
              icon: "◆",
              accent: "amber",
              kpi: "≈ 2,700 L",
              kpiLabel: "virtual water for 1 cotton T-shirt (250 g global avg.)",
              tshirtSplit: [
                { label: "45% Blue (irrigation)", pct: 45, cls: "seg-blue" },
                { label: "41% Green (rain)", pct: 41, cls: "seg-green" },
                { label: "14% Grey (dilution)", pct: 14, cls: "seg-grey" }
              ],
              bullets: ["Packaging accounts for ~42% of all non-fiber plastics produced."],
              ledgerIds: ["L-28", "L-29"]
            },
            {
              step: 4,
              tag: "Node 4 · Daily Habits",
              icon: "💧",
              accent: "water",
              kpi: "≈ 240,000",
              kpiLabel: "plastic particles per liter of bottled water (PNAS, 2024)",
              bullets: [
                "~90% are nanoplastics (< 1 µm) able to cross biological barriers; single-use demand feeds the loop."
              ],
              ledgerIds: ["L-30"]
            }
          ]
        },
        footerSources:
          "Sources: FAO AQUASTAT (2025, L-24); FAO-IWMI (2017, L-25); Macklin et al., Science (2023, L-26); UN-Water (2024, L-27); Chapagain & Hoekstra / WFN (2006, L-28); Geyer et al. (2017, L-29); Qian et al., PNAS (2024, L-30); CRA (L-31).",
        ledgerIds: ["L-24", "L-25", "L-26", "L-27", "L-28", "L-29", "L-30", "L-31"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Often we blame factories or farms as if they were separate from our shopping habits. They are one web.",
            "[Click 1] Farming takes about seventy-two percent of global freshwater withdrawals, and agricultural nitrate is the most common chemical contaminant in groundwater.",
            "[Click 2] Industry takes around sixteen percent, yet around 23.5 million people live on floodplains polluted by metal mining. Globally, forty-two percent of household wastewater went untreated in 2022—and industrial wastewater lacks global data.",
            "[Click 3] Now connect consumer culture. One cotton T-shirt needs about 2,700 liters—nearly half from irrigation, plus rain and chemical dilution. Packaging takes forty-two percent of non-fiber plastics,",
            "[Click 4] and one liter of bottled water holds roughly 240,000 tiny plastic particles. Fast consumption drives extraction and pollution together."
          ],
          spanishNotes:
            "Muestra que producción y consumo son una misma red: (1) agricultura usa ~72% del agua y deja nitratos; (2) minería contamina llanuras con 23,5 millones de habitantes y 42% de aguas domésticas no se trata (con vacío de datos en aguas industriales); (3) 1 camiseta = ~2.700 L (45% riego azul, 41% lluvia verde, 14% dilución gris); (4) 1 L de agua embotellada = ~240.000 partículas plásticas.",
          pronunciation: [
            { word: "withdrawals", ipa: "with-DRAW-ulz" },
            { word: "nitrate", ipa: "NY-trayt" },
            { word: "floodplains", ipa: "FLUD-playnz" },
            { word: "nanoplastics", ipa: "NAN-oh-plas-tiks" }
          ],
          timeCuts: {
            ifLong: "Acorta el desglose de la camiseta a 'including river irrigation and chemical dilution' (-6 palabras).",
            ifShort: "Señala el chip de Colombia: tope básico CRA de 13 m³/mes en ciudades frías."
          }
        }
      },

      /* =====================================================================
       * SLIDE 7 · ACELERADORES DE 2026 (EL NIÑO, IA, EMERGENTES)
       * ===================================================================== */
      {
        id: 7,
        part: "Part II · Global & Local Web",
        title: "2026 Accelerators: Climate, AI, and Invisible Pollutants",
        theme: "dark",
        layout: "accelerators-2026",
        assignedSeconds: 90,
        cumulativeSeconds: 540,
        wordCount: 131,
        maxSteps: 4,
        stamp2026: "JAN–OCT 2026",
        activeBadges: ["hologram", "loops", "uncertainty"],
        livingCircleState: {
          mode: "corner-thermal",
          caption: "2026 heat, AI servers & invisible chemicals tighten the loop"
        },
        culturalDecision: "Expanding high-demand digital and chemical systems faster than local basin limits and monitoring rules.",
        colombiaZoom: {
          title: "Colombia Zoom · Urban Emerging Contaminants",
          metric: "Bogotá & Cali urban water cycle",
          detail: "University researchers (Javeriana & Univalle) detected plasticizers and carbamazepine (anti-seizure drug) in urban water sources.",
          ledgerIds: ["L-41"]
        },
        altText:
          "Three 2026 accelerator panels: El Niño confirmed in Colombia putting over 4.3 million people at risk, global data center water estimates rising from 4.5 to 9.3 trillion liters, and emerging contaminants comparing EU January 2026 PFAS limits against US EPA May to July 2026 proposed rollbacks.",
        visual: {
          elNinoPanel: {
            badge: "1 · Climate Extreme (Oct 8, 2026)",
            title: "El Niño 2026–27 in Colombia",
            kpi: ">4.3M people",
            subkpi: "in 508 municipalities (~45%) at risk (UN OCHA)",
            bullets: [
              "Confirmed Oct 8, 2026 by IDEAM: >97% persistence into Q1 2027 & >80% chance strong/very strong.",
              "Rainfall deficit across Andean, Caribbean & Pacific regions."
            ],
            reviewFlag: "Check Nov 18 update",
            ledgerIds: ["L-32", "L-33"]
          },
          aiPanel: {
            badge: "2 · Digital Infrastructure (*estimates*)",
            title: "AI & Global Data Centers",
            kpi: "~4.5T → ~9.3T L",
            subkpi: "annual water use, 2025 → 2030 (UNU-INWEH, Jun 2026)",
            poolsCalc: "≈ 1.8M → 3.7M Olympic pools/yr (own calc. at 2.5M L/pool)",
            bullets: [
              "Includes direct cooling + indirect power generation (indirect water can exceed direct).",
              "Madani: risk is local when built in dry basins."
            ],
            ledgerIds: ["L-35", "L-36"]
          },
          contaminantsPanel: {
            badge: "3 · Invisible Chemicals & Law Gap",
            title: "PFAS · Microplastics · Medicines",
            euRule: "EU (Jan 12, 2026): Enforced 0.1 µg/L limit for sum of 20 PFAS in drinking water.",
            usRule: "US EPA (May–Jul 2026): Proposed delaying PFOA/PFOS compliance to 2031, dropping 4 PFAS limits & excluding microplastics from UCMR 6 monitoring (no validated method yet).",
            ledgerIds: ["L-37", "L-38", "L-39"]
          }
        },
        footerSources:
          "Sources: IDEAM (Jul & Oct 8, 2026, L-32); UN OCHA (Jun 2026, L-33); UNU-INWEH (Jun 2026, L-35, L-36); EU Dir. 2020/2184 (L-37); US EPA (May–Jul 2026, L-38, L-39); U. Javeriana & Univalle (L-41).",
        ledgerIds: ["L-32", "L-33", "L-35", "L-36", "L-37", "L-38", "L-39", "L-41"],
        speaker: {
          propCue: null,
          englishSteps: [
            "In 2026, three forces tighten this web.",
            "[Click 1] First, climate extremes: on October 8th, IDEAM confirmed El Niño in Colombia, with over an eighty percent chance of strong intensity, putting more than 4.3 million people in 508 municipalities at risk according to UN OCHA.",
            "[Click 2] Second, artificial intelligence. A June 2026 UN University report estimates global data centers used 4.5 trillion liters of water last year—through cooling and power—and could reach 9.3 trillion by 2030, creating local risks in dry basins.",
            "[Click 3] Third, invisible contaminants: PFAS, microplastics, and medicines. The European Union enforced PFAS water limits this January, while in May the US EPA proposed delaying deadlines and dropping four PFAS rules, excluding microplastics from monitoring.",
            "[Click 4] Meanwhile, Bogotá and Cali researchers already detect plasticizers and epilepsy drugs in urban water cycles."
          ],
          spanishNotes:
            "Tres aceleradores de 2026: (1) IDEAM confirmó El Niño el 8 de octubre (>4,3 millones en riesgo según OCHA); (2) IA y centros de datos (estimación UNU de 4,5 a 9,3 billones de litros para 2030, riesgo local en cuencas secas); (3) contaminantes invisibles: la UE aplica límites PFAS desde enero, EE. UU. propuso retrasar/recortar reglas y en Bogotá/Cali ya se detectan plastificantes y carbamazepina.",
          pronunciation: [
            { word: "PFAS", ipa: "PEE-ef-ay-es" },
            { word: "municipalities", ipa: "myoo-nis-i-PAL-i-teez" },
            { word: "plasticizers", ipa: "PLAS-ti-sy-zerz" }
          ],
          timeCuts: {
            ifLong: "Omite 'through cooling and power' y 'excluding microplastics from monitoring' (-8 palabras).",
            ifShort: "Señala la conversión propia en pantalla: 4,5 billones L ≈ 1,8 millones de piscinas olímpicas."
          }
        }
      },

      /* =====================================================================
       * SLIDE 8 · EFECTOS EN SALUD, VIDA DIARIA Y DESIGUALDAD
       * ===================================================================== */
      {
        id: 8,
        part: "Part II · Global & Local Web",
        title: "The Loop Returns to Us: Health & Daily Inequality",
        theme: "light",
        layout: "health-inequality-split",
        assignedSeconds: 60,
        cumulativeSeconds: 600,
        wordCount: 88,
        maxSteps: 4,
        stamp2026: "MAR 2026",
        activeBadges: ["loops", "uncertainty"],
        livingCircleState: {
          mode: "corner-health-return",
          caption: "Polluted & scarce water feeds directly back into People"
        },
        culturalDecision: "Unequal public infrastructure leaves children, rural communities, and women paying with health and unpaid time.",
        colombiaZoom: {
          title: "Colombia Zoom · Urban vs. Rural Safe Water (IRCA)",
          metric: "56% urban vs. 9.7% rural municipalities",
          detail: "2024 SGP-APSB monitoring report (MinVivienda/INS): stark rural safe-water gap across monitored municipalities.",
          ledgerIds: ["L-45"]
        },
        altText:
          "Split diagram showing 1.4 million annual deaths from unsafe water and sanitation plus PFOA carcinogenicity and brain microplastic uncertainty on the left, and a clock representing 250 million daily hours spent by women and girls collecting water plus Colombia's 56 percent urban versus 9.7 percent rural safe water gap on the right.",
        visual: {
          healthColumn: {
            washDeaths: {
              kpi: "≥ 1.4M",
              label: "deaths every year from unsafe water, sanitation & hygiene (WHO)",
              sub: "Includes 395,000 children under age 5 (273,000 from diarrhea)",
              ledgerId: "L-42"
            },
            chemicalRisks: [
              {
                badge: "Proven Hazard",
                title: "PFOA classified as Group 1 Carcinogen",
                detail: "IARC Vol. 135 confirmed PFOA carcinogenic to humans (PFOS Group 2B).",
                uncertain: false,
                ledgerId: "L-40"
              },
              {
                badge: "? Scientific Uncertainty",
                title: "Microplastics in Human Brain Tissue",
                detail: "Nature Medicine (Feb 2025): ~50% higher 2024 vs. 2016 samples; direct disease causation is NOT yet proven.",
                uncertain: true,
                ledgerId: "L-43"
              }
            ]
          },
          dailyColumn: {
            hoursClock: {
              kpi: "~250M",
              unit: "hours every single day",
              label: "spent by women & girls collecting water worldwide",
              source: "UN World Water Development Report (Mar 2026): lost school, income & safety",
              ledgerId: "L-44"
            },
            ruralGapBars: {
              title: "Colombia Municipalities Delivering Safe Water (IRCA, 2024)",
              urbanPct: 56,
              ruralPct: 9.7,
              ledgerId: "L-45"
            }
          }
        },
        footerSources:
          "Sources: WHO (2023, L-42); IARC Vol. 135 (L-40); Nihart et al., Nature Medicine (2025, L-43); UNESCO WWDR (Mar 2026, L-44); MinVivienda/INS SGP-APSB (2024, L-45).",
        ledgerIds: ["L-40", "L-42", "L-43", "L-44", "L-45"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Everything we put into water returns to us.",
            "[Click 1] The World Health Organization links unsafe water, sanitation, and hygiene to at least 1.4 million deaths each year, including nearly 400,000 young children.",
            "[Click 2] Newer pollutants add risk: PFOA is carcinogenic, and a 2025 Nature Medicine study found microplastics in human brains—though direct harm remains under study.",
            "[Click 3] This burden is unequal. Women and girls spend 250 million hours daily carrying water.",
            "[Click 4] In Colombia, fifty-six percent of municipalities deliver safe urban water, versus under ten percent in monitored rural areas."
          ],
          spanishNotes:
            "El bucle regresa a nuestro cuerpo: 1,4 millones de muertes/año por agua y saneamiento inseguros (casi 400.000 niños); el PFOA es cancerígeno y en 2025 hallaron microplásticos en cerebros humanos (aclarando con honestidad que el daño directo sigue en estudio). A la derecha: 250 millones de horas/día de mujeres y niñas cargando agua y la brecha en Colombia (56% urbano vs 9,7% rural).",
          pronunciation: [
            { word: "hygiene", ipa: "HY-jeen" },
            { word: "carcinogenic", ipa: "kar-sin-uh-JEN-ik" },
            { word: "unequal", ipa: "un-EE-kwul" },
            { word: "rural", ipa: "ROOR-ul" }
          ],
          timeCuts: {
            ifLong: "Omite 'including nearly 400,000 young children' (-5 palabras).",
            ifShort: "Añade que esas 250 millones de horas equivalen a millones de jornadas escolares perdidas."
          }
        }
      },

      /* =====================================================================
       * SLIDE 9 · COLOMBIA COMO HOLOGRAMA (PARTE = TODO)
       * ===================================================================== */
      {
        id: 9,
        part: "Part II · Global & Local Web",
        title: "Colombia as a Hologram: Water-Rich, Yet Vulnerable",
        theme: "light",
        layout: "colombia-hologram",
        assignedSeconds: 90,
        cumulativeSeconds: 690,
        wordCount: 137,
        maxSteps: 4,
        stamp2026: "SEP–OCT 2026",
        activeBadges: ["hologram", "opposites", "loops"],
        livingCircleState: {
          mode: "corner-colombia",
          caption: "◎ Part = Whole: Colombia mirrors every global driver"
        },
        culturalDecision: "Relying on natural water abundance without matching territorial planning, wastewater plants, or mining enforcement.",
        colombiaZoom: null,
        altText:
          "Map of Colombia showing its 56.2 liters per second per square kilometer water yield paradox alongside three interactive regional pins: Bogotá River Canoas plant delay, 75 percent illegal alluvial gold mining with mercury, and Lake Tota onion farming runoff.",
        visual: {
          paradoxBanner: {
            yieldKpi: "56.2 L/s/km²",
            yieldNote: "≈ 5.6× world average (ENA 2022) — yet 74% of Colombians live in basins with only ~23% of surface water.",
            reservoirNote: "Oct 2026 under El Niño: national reservoirs ~76%; Bogotá avoids rationing for now, while hundreds of towns face risk.",
            ledgerIds: ["L-46", "L-34"]
          },
          pins: [
            {
              pinNumber: 1,
              step: 2,
              region: "Bogotá Basin (Andean Center)",
              globalDriver: "Urban & Industrial Sewage",
              icon: "◈",
              coords: { x: 182, y: 238 },
              title: "Bogotá River & PTAR Canoas Delay",
              kpi: "~$22T COP",
              detail:
                "12 years after the 2014 cleanup ruling, Canoas pumping station is >95% built, but PTAR Canoas treatment plant is still not operating; ~$22 trillion COP approved Sep 2026 to open bidding.",
              ledgerIds: ["L-22", "L-47"]
            },
            {
              pinNumber: 2,
              step: 3,
              region: "Chocó, Antioquia, Bolívar & Amazon",
              globalDriver: "Extractive Mining & Mercury",
              icon: "▲",
              coords: { x: 132, y: 158 },
              title: "Illegal Alluvial Gold Mining (EVOA)",
              kpi: "75% illegal",
              detail:
                "Of 118,410 ha detected in 2025 (MinEnergía/UNODC, Oct 2026), 75% was illegal (82% in 3 depts), dumping banned mercury & creating malaria pits. Court Ruling T-106/2025 protects 30 Amazonian Indigenous peoples.",
              ledgerIds: ["L-48", "L-49"]
            },
            {
              pinNumber: 3,
              step: 4,
              region: "Lake Tota, Boyacá (3,015 m)",
              globalDriver: "Intensive Farming Runoff",
              icon: "✽",
              coords: { x: 214, y: 202 },
              title: "High-Mountain Farming vs. Drinking Water",
              kpi: "~250,000 people",
              detail:
                "Colombia's largest natural lake supplies ~250,000 residents while bordering ~2,500+ ha of intensive green-onion crops; studies link fertilizer runoff to eutrophication.",
              ledgerIds: ["L-50"]
            }
          ]
        },
        footerSources:
          "Sources: IDEAM ENA 2022 (L-46); XM & EAAB (Oct 2026, L-34); Consejo de Estado (2014, L-22) & Alcaldía de Bogotá CONFIS (Sep 2026, L-47); MinEnergía & UNODC (Oct 2026, L-48); Corte Const. T-106/2025 (L-49); CONPES 3801 (L-50).",
        ledgerIds: ["L-22", "L-34", "L-46", "L-47", "L-48", "L-49", "L-50"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Now zoom into Colombia—Morin's hologram in action.",
            "[Click 1] Colombia's water yield is more than five times the world average, yet seventy-four percent of us live in basins with much less water. Today, with reservoirs near seventy-six percent under El Niño, Bogotá avoids rationing for now, but hundreds of towns face shortages.",
            "[Click 2] Look at three local mirrors of global causes. First, urban sewage: twelve years after the 2014 Bogotá River ruling, the main Canoas treatment plant is still not operating; long-term funding of twenty-two trillion pesos was just approved this September to open bidding.",
            "[Click 3] Second, mining: seventy-five percent of alluvial gold-mining area detected in 2025 was illegal, dumping banned mercury into rivers and leaving malaria pits.",
            "[Click 4] Third, Lake Tota, where intensive onion farming threatens water for 250,000 people through eutrophication. Same global web, inside one country."
          ],
          spanishNotes:
            "Sintetiza todo en Colombia (holograma: la parte refleja el todo). Paradoja ENA 2022: >5 veces el promedio mundial de agua, pero 74% de la población vive donde hay menos agua (embalses ~76% en oct-2026; Bogotá sin racionamiento por ahora). Recorre los 3 pines: (1) Río Bogotá / PTAR Canoas aún sin operar ($22 billones aprobados en sep-2026 para licitar), (2) 75% minería aluvial de oro ilegal con mercurio y malaria, (3) Lago de Tota (cebolla y eutrofización para 250.000 personas).",
          pronunciation: [
            { word: "reservoirs", ipa: "REZ-er-vwarz" },
            { word: "sewage", ipa: "SOO-ij" },
            { word: "alluvial", ipa: "uh-LOO-vee-ul" },
            { word: "eutrophication", ipa: "yoo-troh-fi-KAY-shun" }
          ],
          timeCuts: {
            ifLong: "Omite 'Today, with reservoirs near seventy-six percent under El Niño, Bogotá avoids rationing for now, but' (-15 palabras).",
            ifShort: "Menciona la Sentencia T-106 de 2025 que amparó a 30 pueblos indígenas amazónicos frente al mercurio."
          }
        }
      },

      /* =====================================================================
       * SLIDE 10 · HIPÓTESIS (GRAMÁTICA B2: PAST MODALS)
       * ===================================================================== */
      {
        id: 10,
        part: "Part III · Reflection & Action",
        title: "Hypotheses: Which Cultural Decisions Led Us Here?",
        theme: "dark",
        layout: "hypotheses-cards",
        assignedSeconds: 75,
        cumulativeSeconds: 765,
        wordCount: 105,
        maxSteps: 4,
        stamp2026: null,
        activeBadges: ["loops", "hologram"],
        livingCircleState: {
          mode: "corner-question",
          caption: "Inspecting the cultural rules inside the People node"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "Three interactive flip cards explicitly labeled Author's Hypotheses using English B2 past modals—might have treated, must have assumed, and may have failed—to interpret water bankruptcy through Augusto Ángel Maya's cultural framework.",
        visual: {
          rubricTag: "HYPOTHESES · Author's Interpretation Grounded in Evidence (Past Modals)",
          cards: [
            {
              step: 1,
              number: "01",
              frontQuestion: "Why did extraction, plastics & servers scale without water limits?",
              frontClue: "Evidence: ×6 water growth, 70% declining aquifers (L-10, L-16)",
              backTitle: "The Illusion of Infinite Credit",
              modalHighlight: "might have treated",
              backStatement:
                "Modern economies might have treated water as cheap and endless—building thirsty crops, single-use plastics, and giant servers without counting physical limits.",
              ledgerIds: ["L-06", "L-10", "L-16", "L-18"]
            },
            {
              step: 2,
              number: "02",
              frontQuestion: "Why do rivers carry untreated sewage, nitrates & mining waste?",
              frontClue: "Evidence: 42% household sewage untreated, 23.5M on mining floodplains (L-26, L-27)",
              backTitle: "Downstream Blindness",
              modalHighlight: "must have assumed",
              backStatement:
                "Upstream industries and cities must have assumed that pollution was someone else's problem downstream—in rivers, aquifers, or future generations.",
              ledgerIds: ["L-05", "L-25", "L-26", "L-27"]
            },
            {
              step: 3,
              number: "03",
              frontQuestion: "Why did laws arrive decades after PFAS, mercury & river pollution?",
              frontClue: "Evidence: 1950s PFAS vs. 2026 rules; fragmented agencies (L-03, L-07, L-17)",
              backTitle: "Fragmented Boxes",
              modalHighlight: "may have failed",
              backStatement:
                "Governments may have failed because they split one living web into separate offices—one ministry for farming, another for mining, and another for health.",
              ledgerIds: ["L-03", "L-07", "L-17"]
            }
          ],
          synthesisBar:
            "Synthesis (Ángel Maya + UNU-INWEH 2026): Water bankruptcy is not an accident of nature—it is the cumulative result of an unadapted cultural platform."
        },
        footerSources:
          "Note: Author's interpretive hypotheses grounded in Ángel Maya (1996, L-05..L-07), Morin (1994, L-03), UNU-INWEH (2026, L-09..L-12), and FAO-IWMI (2017, L-25).",
        ledgerIds: ["L-03", "L-05", "L-06", "L-07", "L-09", "L-10", "L-12", "L-16", "L-17", "L-18", "L-25", "L-26", "L-27"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Why did we reach this point? Let me share three hypotheses—my own interpretation of the evidence through Ángel Maya's cultural lens.",
            "[Click 1] First, modern economies might have treated water as cheap and endless. When a resource looks infinite, societies build thirsty crops, throwaway plastics, and giant servers without counting natural limits.",
            "[Click 2] Second, upstream industries and cities must have assumed that pollution was someone else's problem downstream—whether in rivers, aquifers, or future generations.",
            "[Click 3] Third, governments may have failed because they split one living web into separate offices: one ministry for farming, another for mining, and another for health.",
            "[Click 4] Together, these cultural habits produced water bankruptcy."
          ],
          spanishNotes:
            "Marca con voz clara los tres modales perfectos B2 que evalúa el profesor: (1) 'might have treated' (trataron el agua como infinita); (2) 'must have assumed' (asumieron que contaminar lo pagaba otro río abajo); (3) 'may have failed' (dividieron una sola red viviente en ministerios desconectados).",
          pronunciation: [
            { word: "hypotheses", ipa: "hy-POTH-uh-seez" },
            { word: "infinite", ipa: "IN-fi-nit" },
            { word: "downstream", ipa: "DOWN-streem" }
          ],
          timeCuts: {
            ifLong: "Omite 'whether in rivers, aquifers, or future generations' (-7 palabras).",
            ifShort: "Recuerda que puedes hacer clic en cualquier tarjeta durante las preguntas para voltearla."
          }
        }
      },

      /* =====================================================================
       * SLIDE 11 · ARREPENTIMIENTOS Y ESPERANZA FUNDAMENTADA (B2 REGRETS)
       * ===================================================================== */
      {
        id: 11,
        part: "Part III · Reflection & Action",
        title: "Regrets — and Proof That Better Decisions Work",
        theme: "light",
        layout: "regrets-and-hope",
        assignedSeconds: 90,
        cumulativeSeconds: 855,
        wordCount: 124,
        maxSteps: 4,
        stamp2026: null,
        activeBadges: ["opposites", "loops"],
        livingCircleState: {
          mode: "corner-recovery",
          caption: "Green adaptive branch restores flow toward Water"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "Three historical regret panels using English B2 shouldn't have, third conditional, and passive voice for the Aral Sea, Flint's 626.25 million dollar settlement, and Bogotá's Canoas delay, balanced by a green Grounded Hope strip showcasing Kazakhstan's Kokaral Dam and Cape Town's 50 percent water reduction.",
        visual: {
          rubricTag: "REGRETS · Past Mistakes (Should Have + 3rd Conditional) & Adaptive Proof",
          regrets: [
            {
              step: 1,
              place: "Aral Sea Basin (1960s)",
              icon: "▲",
              grammarTag: "shouldn't have + 3rd conditional",
              statement:
                "Planners shouldn't have diverted whole rivers just for cotton; if they had respected the basin, the Aral Sea wouldn't have lost over 80% of its water.",
              ledgerIds: ["L-20"]
            },
            {
              step: 2,
              place: "Flint, Michigan (2014 → 2021)",
              icon: "▲",
              grammarTag: "shouldn't have + passive voice",
              statement:
                "Officials shouldn't have cut costs by skipping corrosion control; lead poisoned homes, and a $626.25M settlement was approved in 2021.",
              ledgerIds: ["L-23"]
            },
            {
              step: 3,
              place: "Bogotá River (2014) & Global PFAS",
              icon: "▲",
              grammarTag: "3rd conditional + should have",
              statement:
                "If the 2014 Bogotá River ruling had been implemented on time, the Canoas plant would already be cleaning the river · Regulators should have acted on PFAS decades earlier.",
              ledgerIds: ["L-17", "L-22", "L-47"]
            }
          ],
          hopeStrip: {
            step: 4,
            tag: "✓ GROUNDED HOPE · Cultural Platforms Can Adapt",
            cases: [
              {
                title: "North Aral Sea · Kokaral Dam (2005)",
                detail: "Kazakhstan & World Bank dammed the Syr Darya outlet: water levels rose several meters, salinity dropped, and native fish & fisheries returned.",
                ledgerId: "L-51"
              },
              {
                title: "Cape Town · Beating “Day Zero” (2018)",
                detail: "Tariffs, leak repair, smart meters, and civic cooperation cut urban water demand by >50% (from ~1,200 to ~500 ML/day).",
                ledgerId: "L-52"
              }
            ]
          }
        },
        footerSources:
          "Sources: NASA (L-20); U.S. Dist. Court E.D. Mich. (2021, L-23); Consejo de Estado & Alcaldía Bogotá (L-22, L-47); World Bank Kokaral Project (L-51); City of Cape Town (2018, L-52).",
        ledgerIds: ["L-17", "L-20", "L-22", "L-23", "L-47", "L-51", "L-52"],
        speaker: {
          propCue: null,
          englishSteps: [
            "Looking back, several regrets stand out.",
            "[Click 1] In Central Asia, planners shouldn't have diverted whole rivers just for cotton; if they had respected the basin, the Aral Sea wouldn't have lost over eighty percent of its water.",
            "[Click 2] In Flint, officials shouldn't have cut costs by skipping corrosion control; lead poisoned homes, and a 626-million-dollar settlement was approved in 2021.",
            "[Click 3] In Colombia, if the 2014 Bogotá River ruling had been implemented on time, the Canoas plant would already be cleaning the river today. And chemical regulators should have acted on PFAS decades earlier.",
            "[Click 4] Yet better cultural decisions do work: Kazakhstan's Kokaral Dam partially revived the North Aral Sea and its fish, and Cape Town cut urban water use by over fifty percent to avoid running dry."
          ],
          spanishNotes:
            "Enfatiza las estructuras B2: 'shouldn't have diverted', 'if they had respected... wouldn't have lost', 'was approved' (pasiva), 'if the 2014 ruling had been implemented... would already be cleaning'. Luego cambia el tono a esperanza fundamentada con el Dique Kokaral y Ciudad del Cabo (>50% ahorro).",
          pronunciation: [
            { word: "corrosion", ipa: "kuh-ROH-zhun" },
            { word: "settlement", ipa: "SET-ul-ment" },
            { word: "Kokaral", ipa: "koh-kah-RAL" }
          ],
          timeCuts: {
            ifLong: "En el Paso 4 menciona solo uno de los dos casos positivos (Kokaral o Ciudad del Cabo, -12 palabras).",
            ifShort: "Añade que en el Aral Norte bajó la salinidad y regresó la pesca local."
          }
        }
      },

      /* =====================================================================
       * SLIDE 12 · CIERRE CIRCULAR ("TRANSFORMAR BIEN")
       * ===================================================================== */
      {
        id: 12,
        part: "Part III · Reflection & Action",
        title: "Back to the Circle: Learning to Transform Well",
        theme: "dark",
        layout: "closing-circle",
        assignedSeconds: 45,
        cumulativeSeconds: 900,
        wordCount: 68,
        maxSteps: 4,
        stamp2026: "DEC 8–10, 2026",
        activeBadges: ["opposites", "loops", "hologram", "uncertainty"],
        livingCircleState: {
          mode: "hero-broken-and-choice",
          caption: "Full circle returns with the red Pollution feedback arrow"
        },
        culturalDecision: null,
        colombiaZoom: null,
        altText:
          "Final full-screen Living Circle showing Water, Plants, and People now joined by a red Pollution arrow flowing from People back into Water, flanked by scientific uncertainties, the December 8 to 10, 2026 UN Water Conference in Abu Dhabi, and Know, Ask, Think actions.",
        visual: {
          redArrowLabel: "HUMAN POLLUTION & OVER-EXTRACTION",
          angelMayaQuote: "Ángel Maya (1996, p. 65): Solving the crisis means learning to “transform well” within living limits.",
          uncertaintiesCard: {
            title: "? Open Uncertainties We Must Respect",
            items: [
              "Global industrial wastewater treatment remains unmeasured in aggregate (UN-Water, 2024).",
              "Long-term causal effects of micro- and nanoplastics in human organs remain under study (Nature Medicine, 2025)."
            ],
            ledgerIds: ["L-27", "L-43"]
          },
          milestoneCard: {
            title: "Next Global Decision Point",
            event: "2026 UN Water Conference",
            whenWhere: "Abu Dhabi · Dec 8–10, 2026 (UAE & Senegal co-hosts)",
            note: "Meets just three weeks from today, as El Niño 2026–27 intensifies in Colombia.",
            reviewFlag: "Check Nov 18 agenda",
            ledgerIds: ["L-53"]
          },
          actions: [
            { verb: "KNOW", text: "your local basin & where tap water comes from" },
            { verb: "ASK", text: "for real enforcement (Canoas, mercury, PFAS)" },
            { verb: "THINK", text: "before buying fast goods or dumping chemicals" }
          ],
          closingLine: "Without water, there are no plants — and no people. Thank you."
        },
        footerSources:
          "Sources: Ángel Maya (1996, p. 65, L-06); UN-Water (2024, L-27); Nihart et al. (2025, L-43); UN-Water Abu Dhabi 8–10 Dec 2026 (L-53).",
        ledgerIds: ["L-06", "L-27", "L-43", "L-53"],
        speaker: {
          propCue: "Utilería física: en el Paso 4 levanta de nuevo el vaso de agua real para cerrar el círculo.",
          englishSteps: [
            "[Click 1] Return to our circle—now with the red arrow we created: human pollution flowing back into our water.",
            "[Click 2] Science still faces uncertainties, from unmeasured industrial wastewater to microplastics in our bodies.",
            "[Click 3] This December, the UN Water Conference will meet in Abu Dhabi as El Niño peaks here.",
            "[Click 4] Know your basin, demand real enforcement, and consume wisely. Without water, there are no plants—and no people. Thank you."
          ],
          spanishNotes:
            "Señala la flecha roja que nosotros añadimos al círculo de la Diapositiva 1. Reconoce las dos incertidumbres abiertas (aguas industriales y microplásticos), menciona que del 8 al 10 de diciembre de 2026 se reúne la Conferencia de la ONU en Abu Dabi, levanta tu vaso con KNOW · ASK · THINK y cierra: 'Without water, there are no plants—and no people. Thank you.'",
          pronunciation: [
            { word: "uncertainties", ipa: "un-SUR-ten-teez" },
            { word: "Abu Dhabi", ipa: "AH-boo DAH-bee" },
            { word: "enforcement", ipa: "en-FORS-ment" }
          ],
          timeCuts: {
            ifLong: "Acorta el Paso 2 a 'Science still faces open questions.' (-9 palabras).",
            ifShort: "Añade al final: 'I would be happy to answer your questions.'"
          }
        }
      }
    ],

    /* =======================================================================
     * SLIDE 13 (ANEXO NAVEGABLE) · FUENTES COMPLETAS GENERADAS DE FUENTES.md
     * ======================================================================= */
    sourcesSlide: {
      id: 13,
      part: "Annex · Verified Bibliography",
      title: "Verified Primary Sources (Data Cutoff: 2026-10-29)",
      theme: "light",
      layout: "sources-annex",
      assignedSeconds: 0,
      maxSteps: 0,
      groups: [
        {
          id: "part1",
          heading: "Part I · Physiology & Theoretical Framework (Slides 1–3)",
          entries: [
            { slides: "1", org: "USGS Water Science School", year: "n.d.", title: "The Water in You: Water and the Human Body (Mitchell, J. Biol. Chem. 158)", ledger: "L-01" },
            { slides: "1", org: "NOAA National Ocean Service", year: "2024", title: "How much oxygen comes from the ocean? (≥50% oceanic plankton)", ledger: "L-02" },
            { slides: "2, 10", org: "Edgar Morin", year: "1994 [1990]", title: "Introducción al pensamiento complejo (Gedisa, pp. 32, 85–110)", ledger: "L-03" },
            { slides: "2", org: "Edgar Morin / UNESCO", year: "1999", title: "Los siete saberes necesarios para la educación del futuro (Cap. V)", ledger: "L-04" },
            { slides: "3, 10, 12", org: "Augusto Ángel Maya", year: "1996", title: "El reto de la vida: ecosistema y cultura (Ecofondo, pp. 26–30, 65, 79–86)", ledger: "L-05..L-07" },
            { slides: "3", org: "Augusto Ángel Maya", year: "1995", title: "La fragilidad ambiental de la cultura (Univ. Nacional – IDEA)", ledger: "L-07, L-08" }
          ]
        },
        {
          id: "part2a",
          heading: "Part II-A · Water Bankruptcy, History & Consumption (Slides 4–6)",
          entries: [
            { slides: "4, 10", org: "Madani / UNU-INWEH", year: "Jan 2026", title: "Global Water Bankruptcy (DOI: 10.53328/INR26KAM001) & Water Resour. Manag.", ledger: "L-09..L-12" },
            { slides: "4", org: "van Vliet et al.", year: "2023", title: "Global river water quality under climate change & extremes (Nat. Rev. Earth Environ. 4)", ledger: "L-13" },
            { slides: "4", org: "WHO & UNICEF JMP", year: "Aug 2025", title: "Progress on household drinking water, sanitation and hygiene 2000–2024", ledger: "L-15" },
            { slides: "5", org: "UNESCO WWDR & OWID", year: "2021 / 2024", title: "Valuing Water (Prologue: ×6 freshwater use) & Water Use and Stress", ledger: "L-16" },
            { slides: "5, 6", org: "Lu & Tian / Geyer et al.", year: "2017", title: "Global nitrogen fertilizer (ESSD 9) & All plastics ever made (Sci. Adv. 3)", ledger: "L-18, L-19, L-29" },
            { slides: "5, 11", org: "NASA / ITRC / E.D. Mich.", year: "2021–2023", title: "World of Change: Aral Sea; PFAS History; Flint Water $626.25M Settlement", ledger: "L-17, L-20, L-23" },
            { slides: "6", org: "FAO AQUASTAT & FAO-IWMI", year: "2017 / 2025", title: "Sectoral withdrawals (~72/16/12%) & Water pollution from agriculture", ledger: "L-24, L-25" },
            { slides: "6", org: "Macklin et al. / UN-Water", year: "2023 / 2024", title: "Metal mining impacts on rivers (Science 381) & SDG 6.3.1 Wastewater Update", ledger: "L-26, L-27" },
            { slides: "6", org: "Chapagain & Hoekstra / Qian et al.", year: "2006 / 2024", title: "Cotton water footprint (Ecol. Econ. 60) & Bottled water nanoplastics (PNAS 121)", ledger: "L-28, L-30" }
          ]
        },
        {
          id: "part2b",
          heading: "Part II-B & III · 2026 Accelerators, Health, Colombia & Solutions (Slides 7–12)",
          entries: [
            { slides: "4, 7, 9", org: "IDEAM, UN OCHA, MinVivienda, XM", year: "May–Oct 2026", title: "El Niño 2026–27 confirmation (Oct 8), OCHA impact report (Jun 19) & reservoir bulletins", ledger: "L-14, L-32..L-34" },
            { slides: "7", org: "Aczel, Madani et al. / UNU-INWEH", year: "Jun 2026", title: "Environmental Cost of Artificial Intelligence: Carbon, Water, and Land Footprints", ledger: "L-35, L-36" },
            { slides: "7, 8", org: "EU / US EPA / IARC", year: "2023–Jul 2026", title: "EU Dir. 2020/2184; EPA PFAS & CCL 6 / UCMR 6 proposals; IARC Vol. 135 (PFOA/PFOS)", ledger: "L-37..L-40" },
            { slides: "7", org: "U. Javeriana & Univalle", year: "2023–2025", title: "Emerging contaminants (plasticizers, carbamazepine) in Bogotá & Cali water cycles", ledger: "L-41" },
            { slides: "8", org: "WHO / Nihart et al. / UNESCO", year: "2023–Mar 2026", title: "WASH disease burden; Brain microplastics (Nat. Med. 2025); WWDR 2026 (250M hrs/day)", ledger: "L-42..L-44" },
            { slides: "6, 8, 9", org: "IDEAM ENA 2022, CRA, MinVivienda/INS", year: "2024", title: "Estudio Nacional del Agua 2022; CRA Res. 943/039; IRCA urban/rural monitoring", ledger: "L-31, L-45, L-46" },
            { slides: "5, 9, 11", org: "Consejo de Estado, Alcaldía Bogotá, MinEnergía/UNODC, Corte Const., CONPES", year: "2013–Oct 2026", title: "Río Bogotá & CONFIS $22T PTAR Canoas; EVOA 2025 (Oct 2026); T-106/2025; CONPES 3801", ledger: "L-21, L-22, L-47..L-50" },
            { slides: "11, 12", org: "World Bank, Cape Town, UN-Water", year: "2005–Dec 2026", title: "North Aral Kokaral Dam; Cape Town Day Zero; UN Water Conference Abu Dhabi (8–10 Dec 2026)", ledger: "L-51..L-53" }
          ]
        }
      ]
    },

    qaBank: [
      {
        q: "Why start with philosophy (Morin & Ángel Maya) instead of jumping straight into water numbers?",
        a: "Numbers show symptoms, not causes. Ángel Maya explains that water scarcity and pollution come from cultural decisions—our tools, laws, and consumption—while Morin shows how climate, farming, and health are woven together."
      },
      {
        q: "If Colombia has >5× the world average water yield, why do towns face shortages?",
        a: "According to IDEAM's ENA 2022, 77% of surface water is in Amazon, Orinoco, and Pacific basins, while 74% of Colombians live in Andean and Caribbean basins with far less water and higher pollution (L-46)."
      },
      {
        q: "Do we know for sure that microplastics cause brain disease?",
        a: "No. The 2025 Nature Medicine study detected nanoplastics in brain tissue and higher levels in dementia cases, but the authors explicitly state causation is not yet proven (L-43). Uncertainty is still a reason for precaution."
      },
      {
        q: "Should we stop using AI because of data center water consumption?",
        a: "Agriculture still takes ~72% of global withdrawals (L-24). As UN researcher Kaveh Madani stresses, AI water risk is local—companies shouldn't place thirsty cooling systems in dry basins without strict local rules (L-35)."
      },
      {
        q: "Why isn't the Bogotá River clean if a court ordered it in 2014?",
        a: "While the Canoas pumping station is >95% built, the main PTAR Canoas treatment plant itself still hasn't been constructed—Bogotá approved ~$22 trillion COP in September 2026 to open public bidding (L-47)."
      },
      {
        q: "What realistic action can a student take if farming and mining dominate water use?",
        a: "Personal habits and civic pressure reinforce each other: buy fewer fast-fashion garments (~2,700 L per cotton shirt, L-28), skip single-use bottled water, never flush medicines, and demand enforcement of environmental rulings."
      }
    ]
  };
})();
