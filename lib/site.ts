export const site = {
  name: "AISaasGo",
  url: "https://image.aisaasgo.org",
  api: "https://aisaasgo.org",
  github: "https://github.com/cf12436/gptimage_prompts",
  community: "https://qcn8akg1pg2d.feishu.cn/wiki/LsgqwhH4JiKGMyknvGlcZ7OFnCd",
  skill:
    "https://github.com/cf12436/gptimage_prompts/tree/main/agents/skills/aisaasgo-image-prompts",
  skillCommand:
    "npx skills add cf12436/gptimage_prompts --skill aisaasgo-image-prompts",
};

export const categoryLabels: Record<string, string> = {
  "Architecture & Spaces": "建筑空间",
  "Brand & Logos": "品牌标识",
  "Characters & People": "人物角色",
  "Charts & Infographics": "信息图表",
  "Documents & Publishing": "文档出版",
  "History & Classical Themes": "历史古典",
  "Illustration & Art": "插画艺术",
  "Other Use Cases": "创意探索",
  "Photography & Realism": "摄影写实",
  "Posters & Typography": "海报排版",
  "Products & E-commerce": "产品电商",
  "Scenes & Storytelling": "场景叙事",
  "UI & Interfaces": "界面设计",
};

export interface PromptCase {
  id: number;
  title: string;
  image: string;
  imageAlt: string;
  sourceLabel: string;
  sourceUrl: string;
  prompt: string;
  promptPreview: string;
  category: string;
  styles: string[];
  scenes: string[];
  featured: boolean;
  githubUrl: string;
}
