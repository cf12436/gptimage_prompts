import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "AISaasGo Image — 开源 AI 图像提示词灵感库",
    template: "%s · AISaasGo Image",
  },
  description:
    "探索、收藏并免费复制高质量 AI 图像提示词。涵盖摄影、海报、插画、产品与品牌设计，无需登录，让每一个想法成为图像。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AISaasGo Image — 让想象，有迹可循。",
    description:
      "免费、开放、无需登录的 AI 图像提示词库。找到灵感，复制提示词，开始创作。",
    url: site.url,
    siteName: "AISaasGo Image",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AISaasGo Image",
    description: "免费开源的 AI 图像提示词灵感库",
  },
};

const clarity = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","ygdxbc4avf");`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          id="microsoft-clarity"
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: clarity }}
        />
      </head>
      <body>
        <a className="skip-link" href="#library">
          跳转到提示词库
        </a>
        {children}
      </body>
    </html>
  );
}
