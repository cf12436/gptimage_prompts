"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCheck,
  ChevronDown,
  Code2,
  Copy,
  Github,
  Globe2,
  ImageIcon,
  Menu,
  Search,
  Sparkles,
  Terminal,
  Users,
  X,
} from "lucide-react";
import { categoryLabels, site, type PromptCase } from "@/lib/site";
import { HeroVideo } from "./hero-video";

const storageKey = "aisaasgo:bookmarks:v1";
const pageSize = 24;

function CaseImage({
  item,
  eager = false,
}: {
  item: PromptCase;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="image-fallback">
      <ImageIcon size={30} />
      <span>{item.title}</span>
    </div>
  ) : (
    <img
      src={item.image}
      alt={item.imageAlt || item.title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function PromptLibrary({ cases }: { cases: PromptCase[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("curated");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [limit, setLimit] = useState(pageSize);
  const [selected, setSelected] = useState<PromptCase | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dialogImage, setDialogImage] = useState<PromptCase | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );
      if (Array.isArray(stored))
        setBookmarks(
          stored.filter(
            (id): id is number =>
              typeof id === "number" && cases.some((c) => c.id === id),
          ),
        );
    } catch {
      /* Bookmarks are optional; browsing works with storage disabled. */
    }
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    const id = Number(params.get("prompt"));
    const item = cases.find((c) => c.id === id);
    if (item) setSelected(item);
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, [cases]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected && dialog) {
      restoreFocus.current = document.activeElement as HTMLElement;
      setCopied(false);
      setDialogImage(selected);
      dialog.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        dialog.close();
        document.body.style.overflow = previous;
        restoreFocus.current?.focus();
      };
    }
  }, [selected]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + 1;
    });
    return map;
  }, [cases]);

  const results = useMemo(() => {
    const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const filtered = cases.filter((item) => {
      const haystack = [
        item.title,
        item.prompt,
        item.category,
        categoryLabels[item.category],
        ...item.styles,
        ...item.scenes,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (category === "all" || item.category === category) &&
        (!savedOnly || bookmarks.includes(item.id)) &&
        terms.every((term) => haystack.includes(term))
      );
    });
    return filtered.sort((a, b) =>
      sort === "newest"
        ? b.id - a.id
        : sort === "oldest"
          ? a.id - b.id
          : Number(b.featured) - Number(a.featured) || b.id - a.id,
    );
  }, [cases, query, category, savedOnly, bookmarks, sort]);

  function updateQuery(value: string) {
    setQuery(value);
    setLimit(pageSize);
  }
  function updateCategory(value: string) {
    setCategory(value);
    setLimit(pageSize);
  }
  function toggleBookmark(id: number) {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((value) => value !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      setToast("浏览器未允许本地存储，收藏仅在本次访问有效。");
    }
  }
  async function copy(text: string, prompt = false) {
    try {
      await navigator.clipboard.writeText(text);
      if (prompt) {
        setCopied(true);
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      }
      setToast("已复制，可以粘贴到你的创作工具中。");
    } catch {
      setToast("复制失败，请选中文字后手动复制。");
    }
  }
  function explore(term?: string) {
    if (term !== undefined) updateQuery(term);
    document
      .getElementById("library")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    searchRef.current?.focus({ preventScroll: true });
  }
  function closeDialog() {
    setSelected(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("prompt")) {
      url.searchParams.delete("prompt");
      window.history.replaceState(null, "", url);
    }
  }

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <HeroVideo />
        <div className="hero-shade" />
        <header className="site-header">
          <nav className="navbar liquid-glass" aria-label="主导航">
            <a href="/" className="brand">
              <span className="brand-symbol">
                <Globe2 size={24} />
              </span>
              <span>
                AISaasGo<span className="brand-suffix"> / IMAGE</span>
              </span>
            </a>
            <div className="desktop-nav">
              <a href="#library">探索提示词</a>
              <a href="#guide">使用指南</a>
              <a href="#skill">
                Agent Skill <span className="tiny-dot" />
              </a>
            </div>
            <div className="nav-actions">
              <a
                className="github-nav"
                href={site.github}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />
                <span>GitHub</span>
                <ArrowUpRight size={13} />
              </a>
              <a
                className="community-nav liquid-glass"
                href={site.community}
                target="_blank"
                rel="noreferrer"
              >
                免费交流群 <ArrowUpRight size={14} />
              </a>
              <button
                className="mobile-menu-button icon-button"
                aria-label={mobileMenu ? "关闭导航" : "打开导航"}
                aria-expanded={mobileMenu}
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
          {mobileMenu && (
            <div className="mobile-nav liquid-glass">
              {[
                ["#library", "探索提示词"],
                ["#guide", "使用指南"],
                ["#skill", "Agent Skill"],
                [site.community, "免费微信交流群"],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileMenu(false)}>
                  {label}
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          )}
        </header>
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow">
            <span className="status-dot" /> OPEN SOURCE. OPEN IMAGINATION.
          </span>
          <h1 id="hero-title">
            Every image starts
            <br />
            with an <em>idea.</em>
          </h1>
          <p className="hero-chinese">让想象，有迹可循。</p>
          <p className="hero-description">
            发现值得收藏的图像提示词。
            <br className="mobile-only" />
            从一个灵感，到你的下一件作品。
          </p>
          <form
            className="hero-search liquid-glass"
            onSubmit={(event) => {
              event.preventDefault();
              explore();
            }}
          >
            <Search size={19} aria-hidden="true" />
            <input
              aria-label="搜索灵感"
              placeholder="寻找灵感，试试「电影感」「产品摄影」…"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
            <button className="search-submit" aria-label="探索搜索结果">
              <ArrowRight size={20} />
            </button>
          </form>
          <div className="hero-popular">
            <span>灵感关键词</span>
            {["海报", "摄影", "品牌", "3D"].map((term) => (
              <button key={term} onClick={() => explore(term)}>
                {term}
                <ArrowUpRight size={10} />
              </button>
            ))}
          </div>
        </div>
        <div className="hero-bottom">
          <div className="hero-proof">
            <span>
              <strong>{cases.length}</strong> 精选提示词
            </span>
            <i />
            <span>免费开放</span>
            <i />
            <span>无需登录</span>
          </div>
          <a href="#library" className="scroll-link">
            向下探索 <ArrowDown size={14} />
          </a>
          <span className="hero-edition">THE PROMPT COLLECTION — VOL. 01</span>
        </div>
      </section>

      <section
        className="library section-container"
        id="library"
        aria-labelledby="library-title"
      >
        <div className="section-topline">
          <span className="eyebrow">THE CREATIVE LIBRARY</span>
          <span className="index-label">01 / EXPLORE</span>
        </div>
        <div className="library-heading">
          <div>
            <h2 id="library-title">
              找到你的下一次 <em>灵感。</em>
            </h2>
            <p>好作品的起点，往往是一句恰到好处的提示词。</p>
          </div>
          <a
            className="text-link"
            href={`${site.github}/issues/new`}
            target="_blank"
            rel="noreferrer"
          >
            分享你的提示词 <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="library-toolbar">
          <div className="library-search">
            <Search size={17} />
            <input
              ref={searchRef}
              aria-label="搜索提示词"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="搜索提示词、风格、场景…"
            />
            {query && (
              <button
                className="icon-button"
                aria-label="清空搜索"
                onClick={() => updateQuery("")}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="library-controls">
            <button
              className={`saved-toggle ${savedOnly ? "active" : ""}`}
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly(!savedOnly);
                setLimit(pageSize);
              }}
            >
              <Bookmark size={15} fill={savedOnly ? "currentColor" : "none"} />
              我的收藏<span>{bookmarks.length}</span>
            </button>
            <div className="sort-select">
              <select
                aria-label="提示词排序"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setLimit(pageSize);
                }}
              >
                <option value="curated">精选优先</option>
                <option value="newest">最新收录</option>
                <option value="oldest">最早收录</option>
              </select>
              <ChevronDown size={13} />
            </div>
          </div>
        </div>
        <div className="category-list" aria-label="提示词分类">
          <button
            className={category === "all" ? "active" : ""}
            aria-pressed={category === "all"}
            onClick={() => updateCategory("all")}
          >
            全部灵感 <span>{cases.length}</span>
          </button>
          {Object.keys(counts)
            .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
            .map((value) => (
              <button
                key={value}
                className={category === value ? "active" : ""}
                aria-pressed={category === value}
                onClick={() => updateCategory(value)}
              >
                {categoryLabels[value] || value}
                <span>{counts[value]}</span>
              </button>
            ))}
        </div>
        <div className="results-line">
          <p aria-live="polite">
            {savedOnly
              ? "你的本地收藏"
              : category === "all"
                ? "全部创意"
                : categoryLabels[category]}
            <span> / {results.length} 个提示词</span>
          </p>
          <span className="results-note">
            <span className="tiny-dot" /> 随时复制，自由创作
          </span>
        </div>
        {results.length ? (
          <div className="prompt-grid">
            {results.slice(0, limit).map((item, index) => (
              <article className="prompt-card" key={item.id}>
                <div className="card-art">
                  <button
                    className="card-open"
                    onClick={() => setSelected(item)}
                    aria-label={`查看提示词：${item.title}`}
                  >
                    <CaseImage item={item} eager={index < 4} />
                    <span className="card-image-shade" />
                    <span className="card-preview-label">
                      查看完整提示词 <ArrowUpRight size={15} />
                    </span>
                  </button>
                  {item.featured && (
                    <span className="featured-badge liquid-glass">
                      <Sparkles size={11} /> 编辑精选
                    </span>
                  )}
                  <button
                    className={`card-bookmark liquid-glass icon-button ${bookmarks.includes(item.id) ? "is-saved" : ""}`}
                    aria-label={`${bookmarks.includes(item.id) ? "取消收藏" : "收藏"}：${item.title}`}
                    aria-pressed={bookmarks.includes(item.id)}
                    onClick={() => toggleBookmark(item.id)}
                  >
                    <Bookmark
                      size={16}
                      fill={
                        bookmarks.includes(item.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                </div>
                <div className="card-info">
                  <div className="card-meta">
                    <span>
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <span>#{String(item.id).padStart(3, "0")}</span>
                  </div>
                  <button
                    className="card-title"
                    onClick={() => setSelected(item)}
                  >
                    {item.title}
                    <ArrowUpRight size={16} />
                  </button>
                  <div className="card-bottom">
                    <span className="card-style">
                      {item.styles.slice(0, 2).join(" · ")}
                    </span>
                    <button
                      className="quick-copy"
                      aria-label={`复制提示词：${item.title}`}
                      onClick={() => void copy(item.prompt)}
                    >
                      <Copy size={13} />
                      <span>复制</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={32} />
            <h3>
              {savedOnly ? "还没有匹配的收藏" : "换一个关键词，发现新的灵感"}
            </h3>
            <p>
              {savedOnly
                ? "点击图片右上角的收藏图标，保存在当前浏览器，无需账户。"
                : "试试更简短的词，或清除分类条件。中英文关键词都可以搜索。"}
            </p>
            <button
              className="pill-button liquid-glass"
              onClick={() => {
                updateQuery("");
                updateCategory("all");
                setSavedOnly(false);
              }}
            >
              浏览全部提示词 <ArrowRight size={15} />
            </button>
          </div>
        )}
        <div className="library-end">
          {results.length > limit && (
            <button
              className="load-more liquid-glass"
              onClick={() => setLimit(limit + pageSize)}
            >
              探索更多灵感 <ArrowDown size={15} />
              <span>{Math.min(pageSize, results.length - limit)} more</span>
            </button>
          )}
          <p>
            已展示 {Math.min(limit, results.length)} / {results.length} 个提示词
          </p>
        </div>
      </section>

      <section
        className="guide-section section-container"
        id="guide"
        aria-labelledby="guide-title"
      >
        <div className="section-topline">
          <span className="eyebrow">FROM PROMPT TO POSSIBILITY</span>
          <span className="index-label">02 / HOW IT WORKS</span>
        </div>
        <div className="guide-heading">
          <h2 id="guide-title">
            灵感到作品，
            <br />
            <em>只差一次尝试。</em>
          </h2>
          <p>
            不必从空白开始。
            <br />
            把好的提示词，变成你自己的创作语言。
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              n: "01",
              icon: Search,
              title: "发现一种可能",
              description:
                "按场景与风格探索案例，打开图片查看完整提示词，找到与你的想法相近的起点。",
              tag: "FIND YOUR INSPIRATION",
            },
            {
              n: "02",
              icon: Copy,
              title: "复制，再加一点你",
              description:
                "一键复制提示词，替换主体、文案、颜色和画面比例。遇到参考图要求时，上传你有权使用的图片。",
              tag: "MAKE IT YOUR OWN",
            },
            {
              n: "03",
              icon: Sparkles,
              title: "让想象成为画面",
              description:
                "粘贴到支持图像生成的工具中。观察结果，逐步调整构图和细节，让下一次生成更接近心中所想。",
              tag: "CREATE SOMETHING NEW",
            },
          ].map((step) => (
            <article className="step-card" key={step.n}>
              <div className="step-top">
                <span>{step.n}</span>
                <step.icon size={21} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="step-tag">{step.tag}</span>
            </article>
          ))}
        </div>
        <p className="usage-note">
          提示词浏览、复制与交流群均免费。第三方图像生成服务可能单独计费；示例效果随模型、参数与参考图片而变化。
        </p>
      </section>

      <section
        className="skill-section section-container"
        id="skill"
        aria-labelledby="skill-title"
      >
        <div className="skill-panel liquid-glass">
          <div className="skill-copy">
            <span className="eyebrow">
              <Terminal size={14} /> MADE FOR YOUR AGENT
            </span>
            <h2 id="skill-title">
              把灵感库，
              <br />
              交给你的 <em>Agent.</em>
            </h2>
            <p>
              安装 AISaasGo Image Prompts Skill，让你的 AI
              助手根据目标挑选案例、组织构图，把模糊的想法整理成可用的提示词。
            </p>
            <a
              className="text-link"
              href={site.skill}
              target="_blank"
              rel="noreferrer"
            >
              了解 AISaasGo Skill <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="terminal-card">
            <div className="terminal-top">
              <div>
                <i />
                <i />
                <i />
              </div>
              <span>aisaasgo-image-prompts</span>
              <Terminal size={14} />
            </div>
            <div className="terminal-body">
              <span className="terminal-comment"># 安装开源提示词 Skill</span>
              <div className="terminal-command">
                <span>$</span>
                <code>{site.skillCommand}</code>
                <button
                  className="icon-button"
                  aria-label="复制 Skill 安装命令"
                  onClick={() => void copy(site.skillCommand)}
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="terminal-divider" />
              <span className="terminal-comment">
                # 然后，试着对你的 AI 助手说
              </span>
              <p className="terminal-example">
                “用 AISaasGo 提示词库，帮我设计一张
                <br />
                极简风格的咖啡品牌海报。”
              </p>
              <div className="terminal-result">
                <CheckCheck size={15} /> 匹配风格 <span>→</span> 自定义细节{" "}
                <span>→</span> 输出提示词
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-section section-container">
        <span className="eyebrow">BETTER WHEN SHARED</span>
        <h2>
          创作这件事，<em>一起更有趣。</em>
        </h2>
        <p>
          交流提示词、分享新作品，和同样热爱 AI 创作的人一起探索。
          <br />
          没有付费门槛，只有关于创作的好奇心。
        </p>
        <div className="community-actions">
          <a
            className="white-button"
            href={site.community}
            target="_blank"
            rel="noreferrer"
          >
            <Users size={17} /> 加入免费微信交流群 <ArrowUpRight size={16} />
          </a>
          <a
            className="pill-button liquid-glass"
            href={site.github}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} /> 一起共建开源 <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <footer className="site-footer section-container">
        <div className="footer-main">
          <a className="brand" href="/">
            <Globe2 size={23} />
            <span>
              AISaasGo<span className="brand-suffix"> / IMAGE</span>
            </span>
          </a>
          <p>Good prompts. Endless possibilities.</p>
          <div>
            <a href={site.api} target="_blank" rel="noreferrer">
              AISaasGo API <ArrowUpRight size={12} />
            </a>
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={12} />
            </a>
            <a href="/privacy/">隐私说明</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} AISaasGo · 开源代码采用 MIT 许可
          </span>
          <span>
            案例版权归原作者所有 ·{" "}
            <a
              href={`${site.github}/blob/main/ATTRIBUTION.md`}
              target="_blank"
              rel="noreferrer"
            >
              来源与致谢
            </a>
          </span>
          <span className="footer-signoff">
            BUILT TO INSPIRE <span>↗</span>
          </span>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="prompt-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        aria-labelledby="dialog-title"
      >
        {selected && (
          <div className="dialog-inner">
            <button
              className="dialog-close icon-button liquid-glass"
              aria-label="关闭提示词详情"
              onClick={closeDialog}
            >
              <X size={21} />
            </button>
            <div className="dialog-image">
              {dialogImage && (
                <CaseImage key={dialogImage.id} item={dialogImage} />
              )}
              <a
                className="source-link liquid-glass"
                href={selected.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                来源：{selected.sourceLabel || "原作者"}{" "}
                <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="dialog-content">
              <span className="eyebrow">
                {categoryLabels[selected.category]} / #{selected.id}
              </span>
              <h2 id="dialog-title">{selected.title}</h2>
              <div className="dialog-tags">
                {selected.styles.map((style) => (
                  <span key={style}>{style}</span>
                ))}
              </div>
              <div className="prompt-label">
                <span>完整提示词</span>
                <span>可自由复制与修改</span>
              </div>
              <pre
                className="prompt-text"
                tabIndex={0}
                data-clarity-mask="true"
              >
                {selected.prompt}
              </pre>
              <p className="dialog-hint">
                将 [占位内容]
                替换为你的需求；如提示词提及参考图，请在生成工具中上传对应图片。
              </p>
              <div className="dialog-actions">
                <button
                  className="white-button"
                  onClick={() => void copy(selected.prompt, true)}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "已复制提示词" : "复制提示词"}
                </button>
                <button
                  className="pill-button liquid-glass"
                  aria-pressed={bookmarks.includes(selected.id)}
                  onClick={() => toggleBookmark(selected.id)}
                >
                  <Bookmark
                    size={16}
                    fill={
                      bookmarks.includes(selected.id) ? "currentColor" : "none"
                    }
                  />
                  {bookmarks.includes(selected.id) ? "已收藏" : "收藏"}
                </button>
                <button
                  className="pill-button liquid-glass"
                  onClick={() =>
                    void copy(`${site.url}/?prompt=${selected.id}#library`)
                  }
                >
                  分享 <ArrowUpRight size={15} />
                </button>
              </div>
              <a
                className="dialog-api text-link"
                href={site.api}
                target="_blank"
                rel="noreferrer"
              >
                <Code2 size={16} /> 前往 AISaasGo · 图像生成与 API{" "}
                <ArrowUpRight size={14} />
              </a>
              <p className="dialog-disclaimer">
                本站不调用付费生图接口，不收集 API 密钥。
              </p>
            </div>
          </div>
        )}
      </dialog>
      {toast && (
        <div className="toast liquid-glass" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </main>
  );
}
