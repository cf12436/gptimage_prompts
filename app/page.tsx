import { PromptLibrary } from "@/components/prompt-library";
import data from "@/data/cases.json";

export default function Home() {
  return <PromptLibrary cases={data.cases} />;
}
