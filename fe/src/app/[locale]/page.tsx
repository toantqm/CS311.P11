import Homepage from "@/components/homepage";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Logo from "@/components/logo.png";
import Switcher from "@/components/Main";
import Button from "@/components/Button";
import TryAnimo from "@/components/TryAnimo";

export default function Home() {
  const t = useTranslations("Index");
  const p = useTranslations("Page");
  const m = useTranslations("Main");

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center w-full bg-white dark:bg-neutral-950 dark:text-white">
        <div className="text-center gap-y-4 px-0 lg:px-24 w-full">
          <section className="max-w-screen-lg mx-auto p-2">
            <Switcher
              translations={{
                generateVideo: t("generateVideo"),
                renderEngine: t("renderEngine"),
                promptGenerator: t("promptGenerator"),
                Main: {
                  inputPromptVideo: m("inputPromptVideo"),
                  inputPlaceholder: m("inputPlaceholder"),
                  generating: m("generating"),
                  generate: m("generate"),
                  renderFromCode: m("renderFromCode"),
                  video: m("video"),
                  rendering: m("rendering"),
                  render: m("render"),
                  inputCodeRender: m("inputCodeRender"),
                  inputPromptCode: m("inputPromptCode"),
                  copy: m("copy"),
                  download: m("download"),
                  modelGroups: {
                    openai: m("modelGroups.openai"),
                    claude: m("modelGroups.claude"),
                    deepseek: m("modelGroups.deepseek"),
                  },
                  models: {
                    gpt4: m("models.gpt4"),
                    gpt35FineTuned: m("models.gpt35FineTuned"),
                    gpt35Physics: m("models.gpt35Physics"),
                    claude35: m("models.claude35"),
                    claude3: m("models.claude3"),
                    deepseekR1: m("models.deepseekR1"),
                  },
                  feedbackThanks: m("feedbackThanks"),
                },
              }}
            />
          </section>
        </div>
      </main>
      <footer className="bg-white md:flex dark:bg-neutral-900 border border-t-neutral-200 dark:border-t-neutral-800 border-transparent mt-12">
        <div className="m-auto max-w-screen-lg md:py-4 flex w-full flex-col justify-center md:flex-row md:justify-between">
          <div className="mx-auto w-full max-w-screen-lg p-4 py-6 lg:py-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-300 text-center"></p>
          </div>
        </div>
      </footer>
    </>
  );
}
