"use client";
import { site } from "@/lib/site";
import { LanguageSwitcher, useLanguage } from "./language-provider";

export function PrivacyContent() {
  const { t, language } = useLanguage();
  return (
    <main className="privacy-page">
      <div className="document-navigation">
        <a href={`/?lang=${language}`}>
          {t("← 返回提示词库", "← Back to prompt library")}
        </a>
        <LanguageSwitcher />
      </div>
      <h1>{t("隐私说明", "Privacy notice")}</h1>
      <p>
        {t(
          "本提示词网站无需注册或登录，不要求你提供邮箱、支付信息或 API 密钥。",
          "This prompt library requires no registration or login. We do not ask for your email, payment details, or API keys.",
        )}
      </p>
      <h2>
        {t("本地收藏与语言偏好", "Local bookmarks and language preferences")}
      </h2>
      <p>
        {t(
          "收藏的案例编号和中英文语言偏好保存在当前浏览器的本地存储中，不会同步到服务器或其他设备。清除网站数据会同时清除这些设置。如果浏览器禁止本地存储，仍可在当前页面切换语言和使用收藏。",
          "Bookmarked case IDs and your Chinese/English preference are stored locally in your browser, not synchronized to a server or other devices. Clearing site data removes these settings. If local storage is blocked, language switching and bookmarks still work on the current page.",
        )}
      </p>
      <h2>{t("访问分析", "Usage analytics")}</h2>
      <p>
        {t(
          "本站使用 Microsoft Clarity（项目编号：ygdxbc4avf）了解页面使用情况、改善浏览体验。Clarity 可能处理设备、浏览器、页面交互等信息，并使用 Cookie 或类似技术。具体处理方式见 ",
          "We use Microsoft Clarity (project ID: ygdxbc4avf) to understand page usage and improve the browsing experience. Clarity may process device, browser, and interaction information and use cookies or similar technologies. For details, see the ",
        )}
        <a
          href="https://www.microsoft.com/privacy/privacystatement"
          target="_blank"
          rel="noreferrer"
        >
          {t("Microsoft 隐私声明", "Microsoft Privacy Statement")}
        </a>
        {t(
          "。你可以通过浏览器隐私设置或内容拦截工具限制第三方分析脚本。",
          ". You can limit third-party analytics scripts through browser privacy settings or content blockers.",
        )}
      </p>
      <h2>{t("外部资源与链接", "External resources and links")}</h2>
      <p>
        {t(
          "网站字体来自 Google Fonts，背景视频来自 img.aisaasgo.org。访问这些资源时，对方服务会收到完成网络请求所需的信息。GitHub、微信交流群、案例原始来源及 AISaasGo 主站遵循各自的隐私政策。本站不会在跳转时附带你的本地收藏或 API 密钥。",
          "Fonts are served by Google Fonts and the background video by img.aisaasgo.org. These services receive information needed to fulfill network requests. GitHub, the WeChat community, original case sources, and the AISaasGo main site have their own privacy policies. We do not attach your local bookmarks or API keys to outgoing links.",
        )}
      </p>
      <h2>{t("反馈与内容权利", "Feedback and content rights")}</h2>
      <p>
        {t(
          "如有隐私疑问、案例归属或删除请求，请通过 ",
          "For privacy questions, attribution concerns, or removal requests, contact the maintainers through ",
        )}
        <a href={`${site.github}/issues`}>GitHub Issues</a>
        {t(
          " 联系维护者。公开反馈中请避免提交个人敏感信息。",
          ". Please avoid sharing sensitive personal information in public reports.",
        )}
      </p>
    </main>
  );
}

export function NotFoundContent() {
  const { t, language } = useLanguage();
  return (
    <main className="privacy-page">
      <LanguageSwitcher />
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>
        {t(
          "这个灵感，还未被收录。",
          "This inspiration hasn't been collected yet.",
        )}
      </h1>
      <p>
        {t(
          "页面可能已经移动。回到提示词库，寻找新的创作起点。",
          "This page may have moved. Return to the library to find a new starting point.",
        )}
      </p>
      <p>
        <a href={`/?lang=${language}`}>
          {t("← 返回提示词库", "← Back to prompt library")}
        </a>
      </p>
    </main>
  );
}
