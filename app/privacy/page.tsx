import type { Metadata } from "next";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "隐私说明",
  alternates: { canonical: "/privacy/" },
};
export default function Privacy() {
  return (
    <main className="privacy-page">
      <a href="/">← 返回提示词库</a>
      <h1>隐私说明</h1>
      <p>本提示词网站无需注册或登录，不要求你提供邮箱、支付信息或 API 密钥。</p>
      <h2>本地收藏</h2>
      <p>
        收藏的案例编号保存在当前浏览器的本地存储中，不会同步到服务器或其他设备。清除网站数据会同时清除收藏。
      </p>
      <h2>访问分析</h2>
      <p>
        本站使用 Microsoft
        Clarity（项目编号：ygdxbc4avf）了解页面使用情况、改善浏览体验。Clarity
        可能处理设备、浏览器、页面交互等信息，并使用 Cookie
        或类似技术。具体处理方式见{" "}
        <a
          href="https://www.microsoft.com/privacy/privacystatement"
          target="_blank"
          rel="noreferrer"
        >
          Microsoft 隐私声明
        </a>
        。你可以通过浏览器隐私设置或内容拦截工具限制第三方分析脚本。
      </p>
      <h2>外部资源与链接</h2>
      <p>
        网站字体来自 Google Fonts，背景视频来自
        img.aisaasgo.org。访问这些资源时，对方服务会收到完成网络请求所需的信息。GitHub、微信交流群、案例原始来源及
        AISaasGo 主站遵循各自的隐私政策。本站不会在跳转时附带你的本地收藏或 API
        密钥。
      </p>
      <h2>反馈与内容权利</h2>
      <p>
        如有隐私疑问、案例归属或删除请求，请通过{" "}
        <a href={`${site.github}/issues`}>GitHub Issues</a>{" "}
        联系维护者。公开反馈中请避免提交个人敏感信息。
      </p>
    </main>
  );
}
