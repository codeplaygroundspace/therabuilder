import type { SiteDocument } from "../schema";

/**
 * The `sarah-demo` template expressed as a SiteDocument.
 *
 * Content is transcribed verbatim from https://github.com/codeplaygroundspace/sarah-demo
 * (`src/data/*.ts`, `src/pages/*.astro`, `src/components/sections/*.astro`,
 * `src/styles/theme.css`). It is the fixture proving the schema can hold a complete,
 * real, multi-page therapist site — and the reference for generation (#4) and porting (#5).
 */
export const sarahDemo: SiteDocument = {
  schemaVersion: 1,
  meta: {
    siteName: "Sarah Therapy",
    siteUrl: "https://sarahtherapy.co.uk",
    defaultTitle: "Sarah — CBT Therapist for anxiety, burnout & stress",
    defaultDescription:
      "Sarah is an accredited CBT therapist helping overwhelmed professionals with anxiety, burnout and stress. Sessions available online and in person in Blackheath, London and Sevenoaks, Kent.",
    ogImage: "/web-OG.jpg",
  },
  practitioner: {
    name: "Sarah",
    specialty: "CBT therapy for anxiety, burnout & stress",
    title: "CBT Therapist for anxiety, burnout & stress",
    eyebrow: "Therapy for anxiety, burnout & stress",
    heroSummary:
      "Sarah offers thoughtful, down-to-earth CBT therapy for overwhelmed professionals navigating anxiety, burnout and stress — with sessions shaped around what feels most useful to you.",
    bio: "Before opening my private practice, I spent many years in demanding clinical leadership roles — and burned out myself. That turning point reshaped how I help others work and live differently.",
    credentials: [
      "PG Dip Advanced practice in Cognitive Behavioural Therapy",
      "BSc (Hons) Occupational Therapy",
      "Trained in EMDR (Eye Movement Desensitisation and Reprocessing)",
      "Certificate in Clinical supervision",
      "BABCP Accredited CBT Therapist",
      "HCPC registered Occupational Therapist",
    ],
  },
  contact: {
    email: "hello@sarahtherapy.co.uk",
    phone: "+44 (0) 7700 900482",
    bookingUrl: "/booking/",
    locations: ["Blackheath, South East London", "Sevenoaks, Kent"],
    availability: "In-person and online sessions available",
  },
  nav: [
    { href: "/about/", label: "About" },
    { href: "/therapy/", label: "Therapy" },
    { href: "/faq/", label: "FAQ" },
    { href: "/resources/", label: "Resources" },
    { href: "/contact/", label: "Contact" },
  ],
  footer: {
    location: "Blackheath, London and Sevenoaks, Kent",
    legalLinks: [
      { href: "/privacy/", label: "Privacy" },
      { href: "/cookie-policy/", label: "Cookie policy" },
    ],
  },
  theme: {
    palette: {
      accent: "oklch(0.276 0.008 59.33)",
      accentSoft: "oklch(0.913 0.014 74.418)",
      surface: "oklch(0.956 0.01 81.795)",
      surfaceMuted: "oklch(0.943 0.011 136.56)",
      text: "oklch(0.276 0.008 59.33)",
      textMuted: "oklch(0.512 0.015 141.761)",
      border: "oklch(0.866 0.017 79.343)",
      warm: "oklch(0.671 0.075 60.455)",
    },
    fonts: { body: "Work Sans", display: "Fraunces" },
  },
  pages: [
    {
      slug: "home",
      seoTitle:
        "Sarah — CBT Therapist for anxiety, burnout & stress | London & Kent",
      seoDescription:
        "Sarah is an accredited CBT therapist offering individual therapy for anxiety, burnout and stress. Sessions online and in person in Blackheath, London and Sevenoaks, Kent.",
      sections: [
        {
          type: "hero",
          heading: "Therapy for overwhelmed professionals.",
          body: "You might look like you're coping on the outside, but inside feel exhausted from overthinking, pressure, self doubt and trying to hold everything together.",
          cta: { label: "Book a free consultation", href: "/booking/" },
          image: {
            src: "/person_v1.webp",
            alt: "Sarah, therapist for anxiety, burnout and stress, based in Blackheath London and Sevenoaks Kent",
          },
        },
        {
          type: "logoStrip",
          label: "Insurance I worked with:",
          logos: [
            { src: "/logos/aviva-logo.svg", alt: "Aviva" },
            { src: "/logos/axa-health-logo.svg", alt: "AXA Health" },
            { src: "/logos/vitality-logo.svg", alt: "Vitality" },
            { src: "/logos/bupa-logo.svg", alt: "Bupa" },
          ],
        },
        {
          type: "intro",
          label: "Welcome",
          paragraphs: [
            "Are you looking for support with the pressure, overthinking or self doubt that has started to shape your days? You may look capable on the outside while feeling stretched thin underneath. Therapy can help you slow down, understand what is happening and find more constructive ways to respond.",
            "You might be struggling to set boundaries, express what you need, recover from burnout or make sense of anxiety that keeps returning. You may also be carrying past experiences that are affecting your confidence, relationships or sense of safety in the present.",
            "Whatever you bring, sessions offer a confidential space to explore how it is impacting you and what you would like to change.",
            "Below are some of the areas Sarah can support clients to work through.",
          ],
          cta: { label: "Learn about CBT therapy", href: "/therapy/" },
        },
        {
          type: "infoCards",
          cards: [
            {
              title: "Free consultation",
              body: "I offer a free 20-minute introductory phone or video call where you can ask questions and we can discuss what you are currently seeking support with. This gives us a chance to consider whether we could work well together and gives you an opportunity to see if you think counselling is for you.",
            },
            {
              title: "How therapy can help",
              body: "If you are feeling low, confused or stuck in life, counselling can help bring clarity and understanding to issues that are affecting you. These insights can lead to constructive changes within yourself and in your relationships.",
            },
          ],
        },
        {
          type: "about",
          label: "About Sarah",
          heading: "Grounded, thoughtful and easy to talk to.",
          paragraphs: [
            "Sarah works with adults who want therapy that feels calm, intelligent and human. Her style is warm and steady, with space for reflection as well as practical movement when you need it.",
            "Clients often come to Sarah when they are carrying a lot quietly: workplace stress, anxious thinking, relationship strain, burnout, low confidence or the sense that something is not quite working anymore.",
            "She offers sessions in Blackheath, South East London, as well as Sevenoaks, Kent, and online for clients who prefer the ease of meeting from home.",
          ],
          image: {
            src: "/person_v2.webp",
            alt: "Sarah, accredited CBT therapist offering individual therapy for professionals in London and Kent",
          },
          cta: { label: "Read more about me", href: "/about/" },
        },
        {
          type: "testimonial",
          quote:
            "Therapy does not have to be dramatic to be life-changing. Sometimes it begins with having one place where you can slow down and tell the truth.",
          attribution: "Sarah",
        },
        {
          type: "cta",
          variant: "contact",
          label: "Contact Sarah",
          heading: "Unsure if counselling is right for you?",
          body: "Let's have a chat and we can discuss what brought you here and what you are seeking.",
          note: "There is no obligation to commit!",
          button: { label: "Book a free consultation", href: "/booking/" },
        },
      ],
    },
    {
      slug: "about",
      seoTitle: "About Sarah — CBT Therapist in Blackheath & Sevenoaks",
      seoDescription:
        "Learn about Sarah, an accredited CBT therapist with a background in clinical leadership. Specialising in burnout recovery, anxiety and life transitions in London and Kent.",
      sections: [
        {
          type: "richText",
          label: "About Sarah",
          heading: "Behind the calm exterior, I know how burnout can feel.",
          paragraphs: [
            "Before opening my private practice, I spent many years in demanding clinical leadership roles. On paper, things looked steady: a senior position, team responsibility, targets met and expectations carried. Inside, though, I was running on empty, both physically and emotionally.",
            "For a long time, I kept going by pushing harder. I overlooked the signs that I needed to slow down, set standards for myself that were impossible to sustain, and found it difficult to say no when something did not feel right. I had assumed burnout was something that happened elsewhere, to other people. Reaching a turning point helped me see that something needed to change, and that waiting for permission was keeping me stuck.",
            "I eventually stepped away from the career path I had worked so hard to build and created a private practice shaped by values rather than pressure. Today, I support people who want to work and live differently, not always through drastic life changes, but through stronger self-awareness, resilience and confidence. I do not believe success should cost you your wellbeing. There is more available than simply getting through each week. Therapy can help you make room for your own needs while staying connected to your ambition, care and values.",
          ],
        },
        {
          type: "richText",
          heading: "Qualifications and registrations",
          paragraphs: [
            "I am a recognised provider with Aviva, Axa, BUPA and WPA.",
          ],
          list: [
            "PG Dip Advanced practice in Cognitive Behavioural Therapy",
            "BSc (Hons) Occupational Therapy",
            "Trained in EMDR (Eye Movement Desensitisation and Reprocessing)",
            "Certificate in Clinical supervision",
            "BABCP Accredited CBT Therapist",
            "HCPC registered Occupational Therapist",
          ],
        },
        {
          type: "richText",
          label: "Publications",
          heading: "Writing and resources",
          paragraphs: [
            "Alongside her clinical work, Sarah writes about the intersection of professional identity, burnout and recovery. Her writing draws on both personal experience and her background in clinical leadership to explore what it means to sustain a working life without sacrificing wellbeing.",
            "In 2023 she contributed to a collection of practitioner perspectives on workplace stress, identity and the journey back to self. The piece reflects on the gap between how capable people appear and how depleted they can feel — a theme that shapes much of her therapeutic work today.",
            "Her writing aims to open up conversations that professionals often feel they cannot have in the workplace, and to remind readers that seeking support is a sign of clarity, not weakness.",
          ],
        },
        {
          type: "richText",
          label: "The personal",
          paragraphs: [
            "I work in a gentle, unhurried manner. My aim is to make the therapy room a welcoming space where all feelings can be explored without judgement. I am genuinely curious about the breadth of human experience, and I believe that progress happens when a person feels truly heard. If you find yourself stuck or struggling to put words to what you are carrying, I use active, compassionate listening to help us find a way forwards together.",
            "Equality and respect are central to how I work. I work affirmatively with LGBTQIA+ individuals, those exploring gender or sexual identity, and people navigating relationship structures that fall outside conventional norms. Therapy may include looking at the weight of shame, stigma or the impact of being made to feel like an outsider — experiences that many people carry quietly for a long time.",
            "Above all, I want each person to feel that their story is met with care and without assumption. I am committed to building a space where trust can grow at a pace that feels right for you, and where we can work honestly and openly together.",
          ],
        },
        {
          type: "cta",
          variant: "contact",
          label: "Contact Sarah",
          heading: "Unsure if counselling is right for you?",
          body: "Let's have a chat and we can discuss what brought you here and what you are seeking.",
          note: "There is no obligation to commit!",
          button: { label: "Book a free consultation", href: "/booking/" },
        },
      ],
    },
    {
      slug: "therapy",
      seoTitle: "CBT Therapy for anxiety, burnout & stress — Sarah",
      seoDescription:
        "CBT therapy for anxiety, burnout, perfectionism and life transitions. Individual sessions online and in person in Blackheath, London and Sevenoaks, Kent.",
      sections: [
        {
          type: "split",
          label: "Psychotherapy",
          heading: "CBT therapy for anxiety, burnout and feeling stuck.",
          paragraphs: [
            "Therapy with Sarah is collaborative, practical and paced around what feels most useful to you. The work focuses on understanding your experience from your perspective, while helping you build clearer, steadier ways of responding to pressure, worry and self doubt.",
          ],
          image: {
            src: "/therapy-hero.jpg",
            alt: "Calm therapy setting — natural light, quiet space for reflection and conversation",
          },
          imagePosition: "right",
          cta: { label: "Book a free consultation", href: "/booking/" },
        },
        {
          type: "split",
          label: "CBT therapy",
          heading: "A practical space to understand patterns and make change.",
          paragraphs: [
            "CBT can help you notice the links between thoughts, emotions, body sensations and behaviour. This can be especially useful if you are used to pushing through, overthinking decisions or holding yourself to standards that are difficult to sustain.",
            "Sessions are not about being told what to do. They are a place to explore what is keeping you stuck, reconnect with your values and practise changes that feel realistic in your work, relationships and daily life.",
            "As you begin to separate your own needs from the expectations you have absorbed, therapy can support greater self-acceptance, stronger boundaries and a clearer sense of how you want to move forward.",
          ],
          image: {
            src: "/therapy-cbt.jpg",
            alt: "Person working at a desk — representing the pressures of professional life that therapy can help with",
          },
          imagePosition: "right",
        },
        {
          type: "accordion",
          label: "Areas of support",
          heading: "Topics clients often work through.",
          items: [
            {
              title: "Overthinking and anxiety",
              body: "When the mind keeps running scenarios, replaying conversations or scanning for what could go wrong, sleep, focus and decisions all suffer. Sessions can help you understand what feeds the loop and practise grounded ways to step out of it.",
            },
            {
              title: "Burnout and work pressure",
              body: "High-functioning burnout often looks like still showing up, while feeling flat, depleted or quietly resentful underneath. Therapy gives you space to notice what is driving the pace, recover capacity and rebuild a sustainable relationship with work.",
            },
            {
              title: "Self doubt and perfectionism",
              body: "When good enough never feels good enough, achievement stops feeling like reward. We can look at where the standards came from, the cost of meeting them, and what changes when self-worth stops depending on output.",
            },
            {
              title: "Boundaries and confidence",
              body: "If you tend to over-give, over-explain or stay quiet to keep the peace, boundaries can feel risky. Therapy supports you to recognise your own needs, say what matters and hold a position without spiralling into guilt.",
            },
            {
              title: "Life transitions and identity shifts",
              body: "New roles, relationships, losses or career moves can unsettle a sense of who you are. Sessions offer a steady space to process the change, sit with what is uncertain and reconnect with what you want next.",
            },
            {
              title: "Stress held in the body",
              body: "Tight shoulders, shallow breath, a stomach that knots before meetings — stress lives in the body long after the moment has passed. Therapy can help you notice these signals earlier and respond before the system goes into overdrive.",
            },
          ],
        },
        {
          type: "services",
          label: "Approach and specialties",
          heading: "A practical toolbox for lasting change.",
          body: "Sarah works with a practical, conversational approach that blends reflective therapy with useful strategies you can take back into daily life. Her work is especially suited to people who look capable on the outside but feel overextended, anxious or stuck underneath.",
          items: [
            {
              title: "Anxiety and overwhelm",
              copy: "When your mind is always racing, even simple things can feel heavy. Sarah helps you slow the spiral, understand what is driving it and build steadier ways of responding.",
              image: "/services-images/talking-man.png",
              imageAlt:
                "Illustration of a person in conversation — therapy as a space to talk through anxious, overwhelming thoughts",
            },
            {
              title: "Burnout and stress",
              copy: "Stress has a way of shrinking your world. Together you can look at pressure, perfectionism and emotional exhaustion, then begin rebuilding space, boundaries and recovery.",
              image: "/services-images/working.png",
              imageAlt:
                "Illustration of a person at work — representing the pressure, perfectionism and exhaustion of burnout",
            },
            {
              title: "Confidence and life transitions",
              copy: "If you are navigating change, second-guessing yourself or feeling disconnected from who you used to be, therapy can help you find firmer ground and move forward with more self-trust.",
              image: "/services-images/walk-confident.png",
              imageAlt:
                "Illustration of a person walking forward with confidence — renewed self-trust through life transitions",
            },
          ],
        },
        {
          type: "cta",
          variant: "contact",
          label: "Contact Sarah",
          heading: "Unsure if counselling is right for you?",
          body: "Let's have a chat and we can discuss what brought you here and what you are seeking.",
          note: "There is no obligation to commit!",
          button: { label: "Book a free consultation", href: "/booking/" },
        },
      ],
    },
    {
      slug: "faq",
      seoTitle: "FAQ — Therapy questions answered | Sarah",
      seoDescription:
        "Common questions about starting therapy with Sarah — how it works, what to expect, how many sessions you may need, and how to get in touch.",
      sections: [
        {
          type: "richText",
          label: "FAQ",
          heading: "Questions about therapy",
          paragraphs: [
            "If you are thinking about starting therapy, these answers cover the practical questions people often ask before getting in touch.",
          ],
        },
        {
          type: "accordion",
          items: [
            {
              title: "How does therapy work?",
              body: "Therapy gives you a regular, confidential space to understand what is happening beneath the surface and practise different ways of responding. Sarah works collaboratively, combining CBT with a grounded, practical style that can help you notice patterns, reduce pressure and make changes that fit your real life.",
            },
            {
              title: "Will therapy help?",
              body: "Therapy cannot promise a quick fix, but it can help you feel less alone with what you are carrying. If you feel overwhelmed, anxious, burnt out or stuck, sessions can support you to understand the cycle you are in and build steadier ways forward.",
            },
            {
              title: "How many sessions will I need, and how often?",
              body: "Many people begin with weekly sessions so there is enough consistency to build momentum. The number of sessions depends on what you want support with, your goals and what feels useful as the work develops. This can be reviewed together as therapy progresses.",
            },
            {
              title: "Can anyone go to therapy?",
              body: "Yes. You do not need to wait until things feel unmanageable. Therapy can be helpful if you are struggling day to day, but also if you are functioning outwardly while feeling anxious, exhausted or disconnected inside.",
            },
            {
              title: "Is therapy confidential?",
              body: "Yes, therapy is confidential. Sarah will talk through confidentiality at the start, including the limited situations where there may be a duty to act if there is a serious risk of harm.",
            },
            {
              title: "How much does it cost?",
              body: "Introductory sessions are £95 for 50 minutes, and ongoing therapy is £90 for 50 minutes. A free 20-minute phone call is offered first so you can decide whether the work feels like the right fit before booking. Full session formats, durations and fees are listed on the booking page.",
            },
            {
              title: "Do you accept insurance?",
              body: "Yes. Sarah is a recognised provider with Aviva, AXA, BUPA and WPA. If you would like to use private medical insurance, ask your insurer for an authorisation code before your first session and bring it to your appointment.",
            },
            {
              title: "What is the cancellation policy?",
              body: "The cancellation policy is 24 hours. If you need to change or cancel an appointment, please give as much notice as possible. You will receive an email reminder the day before your scheduled appointment.",
            },
            {
              title: "When does therapy end?",
              body: "Therapy can be short term or longer term depending on your needs. Endings are usually planned together, so there is time to review what has changed and what support may help you continue after sessions finish.",
            },
            {
              title: "Do you see clients worldwide?",
              body: "Online therapy may be available depending on your location, needs and whether Sarah can work with you appropriately from the UK. Please get in touch if you are outside the UK and would like to ask about this.",
            },
          ],
        },
        {
          type: "cta",
          variant: "faq",
          label: "Get in touch",
          heading: "Did not find what you're looking for?",
          body: "I'll happily answer any questions or concerns you may have.",
        },
      ],
    },
    {
      slug: "resources",
      seoTitle: "Resources & writing — Sarah",
      seoDescription:
        "Articles on anxiety, burnout and therapy from Sarah — a CBT therapist in Blackheath and Sevenoaks. Practical insights to support your mental health.",
      sections: [
        {
          type: "resourcesGrid",
          label: "Resources",
          heading: "Writing and resources",
          lead: "Thoughts on therapy, mental health and navigating life. Written for anyone who is curious, struggling, or simply wondering whether things could feel different.",
          posts: [
            {
              slug: "what-is-cbt",
              title: "What Is CBT?",
              excerpt:
                "CBT is a structured approach that helps us understand the connection between our thoughts, feelings, and behaviors.",
              image: "/blog-images/blog-01.webp",
            },
            {
              slug: "first-therapy-session",
              title: "What do I need for my first therapy session?",
              excerpt:
                "For your first therapy session, you don’t need to prepare anything formal, but reflecting on what brings you to therapy can be beneficial.",
              image: "/blog-images/blog-02.webp",
            },
            {
              slug: "coaching-vs-psychotherapy",
              title: "Coaching Vs Psychotherapy",
              excerpt:
                "Psychotherapy and coaching can both offer valuable support, but they are designed for different needs, goals, and stages of personal development.",
              image: "/blog-images/blog-03.webp",
            },
          ],
        },
      ],
    },
    {
      slug: "contact",
      seoTitle: "Contact Sarah — CBT Therapist in London & Kent",
      seoDescription:
        "Get in touch with Sarah to ask about availability, fees or to book a free initial consultation. Online and in-person sessions available.",
      sections: [
        {
          type: "contact",
          label: "Contact",
          heading: "Get in touch.",
          intro: "Sarah offers online appointments for clients across the UK.",
          methods: ["Email", "Phone call", "Text message"],
        },
      ],
    },
  ],
};
