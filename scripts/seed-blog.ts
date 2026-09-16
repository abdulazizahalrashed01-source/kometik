import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const categories = [
    {
      name: "المكونات",
      slug: "ingredients",
      description: "اكتشفي المكونات التي تقوم وراء روتين العناية.",
    },
    {
      name: "الروتين",
      slug: "routines",
      description: "روتينات بسيطة للعناية بالبشرة يومًا بعد يوم.",
    },
    {
      name: "العناية بالبشرة",
      slug: "skincare",
      description: "أساسيات تساعدك على فهم احتياجات بشرتك.",
    },
    {
      name: "نصائح الجمال",
      slug: "beauty-tips",
      description: "نصائح وأفكار صغيرة لتجربة عناية أجمل.",
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const result = await prisma.blogCategory.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    categoryMap.set(category.slug, result.id);
  }

  const posts = [
    {
      title:
        "ما هو حمض الهيالورونيك؟ ولماذا أصبح أساسيًا في روتين الترطيب؟",
      slug: "what-is-hyaluronic-acid",
      excerpt:
        "دليل مبسط لفهم حمض الهيالورونيك ودوره في دعم ترطيب البشرة ومظهرها.",
      content: `حمض الهيالورونيك من أشهر المكونات المستخدمة في منتجات العناية بالبشرة، ويرتبط بشكل أساسي بفكرة الترطيب.

يتميّز هذا المكوّن بقدرته على الارتباط بالماء، ولذلك يدخل في الكثير من السيرومات والكريمات المرطبة.

لكن وجود حمض الهيالورونيك في المنتج لا يعني أن جميع التركيبات متشابهة. نوع التركيبة، تركيز المكوّن، وباقي المكونات المستخدمة معه كلها تؤثر في تجربة المنتج.

لذلك عند اختيار سيروم يحتوي على حمض الهيالورونيك، من الأفضل النظر إلى التركيبة كاملة وليس إلى اسم المكوّن وحده.

في Kometik نؤمن أن فهم المكوّن يجعل اختيار المنتج أسهل وأكثر وعيًا.`,
      seoTitle: "ما هو حمض الهيالورونيك؟ | Kometik",
      seoDescription:
        "تعرّفي على حمض الهيالورونيك ودوره في ترطيب البشرة بطريقة بسيطة وواضحة.",
      categorySlug: "ingredients",
      featured: true,
      daysAgo: 0,
    },

    {
      title: "كيف تبنين روتين عناية بسيط من أربع خطوات؟",
      slug: "simple-skincare-routine-four-steps",
      excerpt:
        "لا تحتاجين إلى عشرات المنتجات لبناء روتين جيد. ابدئي بالأساسيات.",
      content: `الروتين الجيد لا يعني بالضرورة روتينًا طويلًا.

يمكن أن يبدأ روتين العناية الأساسي بأربع مراحل واضحة:

أولًا: التنظيف. إزالة الأوساخ والزيوت الزائدة تساعد على تحضير البشرة لباقي الروتين.

ثانيًا: العلاج. هنا يمكن إضافة منتج مخصص لاحتياجات البشرة، مثل سيروم يحتوي على فيتامين C أو النياسيناميد أو غيرهما.

ثالثًا: الترطيب. المرطب يساعد على منح البشرة إحساسًا بالراحة والنعومة ويدعم الروتين اليومي.

رابعًا: الحماية. في الصباح، تأتي الحماية من الشمس كخطوة أساسية في الروتين.

الفكرة ليست استخدام أكبر عدد ممكن من المنتجات، بل اختيار المنتجات التي تخدم احتياجاتك فعلًا.`,
      seoTitle: "روتين العناية بالبشرة في أربع خطوات | Kometik",
      seoDescription:
        "تعرّفي على طريقة بناء روتين عناية بسيط وعملي من أربع خطوات.",
      categorySlug: "routines",
      featured: false,
      daysAgo: 1,
    },

    {
      title:
        "فيتامين C في العناية بالبشرة: كيف تختارين المنتج المناسب؟",
      slug: "vitamin-c-skincare-guide",
      excerpt:
        "نظرة بسيطة على فيتامين C ولماذا يوجد في الكثير من منتجات الإشراقة والعناية.",
      content: `فيتامين C من أكثر المكونات حضورًا في عالم العناية بالبشرة.

يرتبط استخدامه عادةً بروتينات تهدف إلى تحسين مظهر الإشراقة ودعم مظهر أكثر تجانسًا وحيوية للبشرة.

لكن كلمة Vitamin C وحدها لا تخبرك بكل شيء عن المنتج. توجد صور وتركيبات مختلفة من مشتقات فيتامين C، ولكل تركيبة خصائصها وطريقة استخدامها.

عند اختيار المنتج، من المهم أيضًا الانتباه إلى طريقة حفظه وتركيبته وباقي المكونات الموجودة معه.

وفي الروتين اليومي، من الأفضل إدخال المنتجات الجديدة تدريجيًا ومراقبة مدى تقبل البشرة لها.

المهم هو أن تختاري منتجًا يناسب احتياجاتك الفعلية، وليس مجرد مكوّن شائع.`,
      seoTitle: "دليل فيتامين C للبشرة | Kometik",
      seoDescription:
        "دليل مبسط لفهم فيتامين C واختيار منتجات العناية المناسبة للبشرة.",
      categorySlug: "skincare",
      featured: false,
      daysAgo: 2,
    },

    {
      title: "حاجز البشرة: ما هو ولماذا نهتم به؟",
      slug: "skin-barrier-explained",
      excerpt:
        "فهم حاجز البشرة يساعدك على بناء روتين أكثر لطفًا وتوازنًا.",
      content: `حاجز البشرة هو جزء مهم من وظيفة الجلد، ويساعد في الحفاظ على الماء وحماية البشرة من العوامل الخارجية.

عندما تكون البشرة غير مرتاحة أو جافة أو شديدة الحساسية، من المفيد التفكير في مدى بساطة الروتين والمنتجات المستخدمة.

في كثير من الحالات، تقليل عدد المنتجات والابتعاد عن الروتين المرهق قد يكون بداية جيدة.

الترطيب المنتظم، اختيار منظفات مناسبة، وعدم الإفراط في استخدام المنتجات النشطة كلها عناصر يمكن أن تدخل ضمن روتين أكثر لطفًا.

العناية بالبشرة ليست سباقًا. أحيانًا تكون أفضل خطوة هي العودة إلى الأساسيات.`,
      seoTitle: "ما هو حاجز البشرة؟ | Kometik",
      seoDescription:
        "شرح بسيط لحاجز البشرة وأهميته وكيفية بناء روتين أكثر لطفًا.",
      categorySlug: "skincare",
      featured: false,
      daysAgo: 3,
    },
  ];

  for (const post of posts) {
    const categoryId = categoryMap.get(post.categorySlug);

    if (!categoryId) {
      throw new Error(`Blog category not found: ${post.categorySlug}`);
    }

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo);

    await prisma.blogPost.upsert({
      where: {
        slug: post.slug,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        featured: post.featured,
        published: true,
        publishedAt,
        categoryId,
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        featured: post.featured,
        published: true,
        publishedAt,
        categoryId,
      },
    });
  }

  console.log("Blog seed completed successfully.");
  console.log(`Categories: ${categories.length}`);
  console.log(`Posts: ${posts.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
