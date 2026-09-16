export default function HomeMarquee() {
  const items = [
    "SKINCARE",
    "BEAUTY",
    "SELF CARE",
    "KOMETIK",
    "YOUR BEAUTY",
  ];

  return (
    <section
      aria-label="Kometik beauty marquee"
      dir="ltr"
      className="
        h-[8svh]
        min-h-[52px]
        max-h-[82px]
        overflow-hidden
        bg-[var(--olive)]
        text-white
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          overflow-hidden
        "
      >
        <div
          className="
            flex
            w-max
            items-center
            animate-[kometikMarquee_24s_linear_infinite]
          "
        >
          {[0, 1, 2, 3].map(
            (group) => (
              <div
                key={group}
                className="
                  flex
                  shrink-0
                  items-center
                "
              >
                {items.map(
                  (item) => (
                    <span
                      key={`${group}-${item}`}
                      className="
                        mx-5
                        flex
                        items-center
                        gap-6
                        text-[9px]
                        font-medium
                        tracking-[0.18em]
                        sm:mx-6
                        sm:text-[10px]
                      "
                    >
                      {item}

                      <span
                        aria-hidden="true"
                        className="
                          text-[var(--brick-light)]
                        "
                      >
                        ✦
                      </span>
                    </span>
                  )
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}