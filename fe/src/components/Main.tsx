"use client";

import classNames from "classnames";
import React, { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import {
  Copy,
  Download,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Video,
  WandSparkles,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useChat } from "ai/react";
import Select from "./Select";

const Switcher = ({ translations }: { translations?: any }) => {
  const [topBar, setTopBar] = useState<"main" | "render" | "prompt">("main");
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [promptToCode, setPromptToCode] = useState("");
  const [codeToVideo, setCodeToVideo] = useState("");
  const [promptToCodeModel, setPromptToCodeModel] = useState("gpt-4o");
  const [renderizationLoading, setRenderizationLoading] = useState(false);
  const [currentVideoURL, setCurrentVideoURL] = useState("");

  const cleaner = (code: string) => {
    const cleaned = code.replace(/```python/g, "").replace(/```/g, "");
    return cleaned;
  };

  const handleVideoGeneration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRenderizationLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/code/generation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: promptToCode,
            model: promptToCodeModel,
          }),
        },
      );
      const data = await response.json();
      const code = cleaner(data.code);
      setCodeToVideo(code);
      const iteration = Math.floor(Math.random() * 1000000);

      const response2 = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/video/rendering`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            file_name: "GenScene.py",
            file_class: "GenScene",
            iteration,
            project_name: "GenScene",
          }),
        },
      );

      const data2 = await response2.json();
      const { video_url } = data2;
      setCurrentVideoURL(video_url);
    } catch (error) {
      console.error(error);
    } finally {
      setRenderizationLoading(false);
    }
  };

  const handleRenderization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRenderizationLoading(true);
    try {
      const iteration = Math.floor(Math.random() * 1000000);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_PROCESSOR}/v1/video/rendering`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: codeToVideo,
            file_name: "GenScene.py",
            file_class: "GenScene",
            iteration,
            project_name: "GenScene",
          }),
        },
      );
      const data = await response.json();
      const { video_url } = data;
      setCurrentVideoURL(video_url);
    } catch (error) {
      console.error(error);
    } finally {
      setRenderizationLoading(false);
    }
  };

  useEffect(() => {
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkMode(prefersDarkMode);

    return () => {};
  }, []);

  return (
    <div className="w-full">
      <div className="w-full flex flex-col lg:flex-row bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
        <button
          className={classNames(
            "p-2 w-full lg:w-4/12 text-sm lg:text-base rounded-lg transition",
            {
              "bg-white dark:bg-neutral-900 shadow": topBar === "main",
            },
          )}
          onClick={() => setTopBar("main")}
        >
          {translations?.generateVideo}
        </button>
      </div>
      <div className="w-full min-h-[40vh]">
        {topBar === "main" && (
          <div className="w-full">
            <form className="w-full mt-4" onSubmit={handleVideoGeneration}>
              <label htmlFor="prompt" className="text-left">
                {translations?.Main?.inputPromptVideo}
              </label>
              <div className="flex flex-col lg:flex-row gap-x-2 gap-y-2 mt-2">
                <Input
                  id="prompt"
                  type="text"
                  placeholder={translations?.Main?.inputPlaceholder}
                  className="lg:w-96"
                  value={promptToCode}
                  onChange={(e) => setPromptToCode(e.target.value)}
                />
                <Select
                  name="model"
                  id="model"
                  value={promptToCodeModel}
                  onChange={(e) => setPromptToCodeModel(e.target.value)}
                >
                  <optgroup label={translations?.Main?.modelGroups?.openai}>
                    <option value="gpt-4o">
                      {translations?.Main?.models?.gpt4}
                    </option>
                    <option value="ft:gpt-3.5-turbo-1106:astronware:generative-manim-2:9OeVevto">
                      {translations?.Main?.models?.gpt35FineTuned}
                    </option>
                    <option value="ft:gpt-3.5-turbo-1106:astronware:gm-physics-01:9hr68Zu9">
                      {translations?.Main?.models?.gpt35Physics}
                    </option>
                  </optgroup>
                  <optgroup label={translations?.Main?.modelGroups?.claude}>
                    <option value="claude-3-5-sonnet-20240620">
                      {translations?.Main?.models?.claude35}
                    </option>
                    <option value="claude-3-sonnet-20240229">
                      {translations?.Main?.models?.claude3}
                    </option>
                  </optgroup>
                  <optgroup label={translations?.Main?.modelGroups?.deepseek}>
                    <option value="deepseek-r1">
                      {translations?.Main?.models?.deepseekR1}
                    </option>
                  </optgroup>
                </Select>
                <Button
                  className="px-4 flex gap-x-2 items-center justify-center"
                  disabled={renderizationLoading}
                >
                  {renderizationLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  <span>
                    {renderizationLoading
                      ? translations?.Main?.generating
                      : translations?.Main?.generate}
                  </span>
                </Button>
              </div>
            </form>
            <div className="flex flex-col lg:flex-row gap-x-4 mt-2">
              <div className="w-full lg:w-6/12">
                <label htmlFor="code" className="text-left">
                  Render a video from code
                </label>
                <div className="mt-2">
                  <Editor
                    height="40vh"
                    defaultLanguage="python"
                    options={{
                      fontSize: 14,
                      wordWrap: "on",
                    }}
                    theme={isDarkMode ? "vs-dark" : "vs-light"}
                    className="border border-neutral-300 dark:border-neutral-800 rounded-lg"
                    value={codeToVideo}
                    onChange={(value) => {
                      setCodeToVideo(value || "");
                    }}
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12">
                <label htmlFor="code" className="text-left">
                  Video
                </label>
                <video
                  src={currentVideoURL}
                  controls
                  className="mt-2 w-full rounded-lg"
                ></video>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Switcher;
