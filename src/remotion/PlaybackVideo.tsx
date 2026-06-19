import React from "react";
import { Html5Video, useRemotionEnvironment } from "remotion";
import { Video as MediaVideo } from "@remotion/media";

type PlaybackVideoProps = {
  src: string;
  trimBefore?: number;
  style?: React.CSSProperties;
};

/** Html5Video in Player preview; @remotion/media Video for web-renderer export */
export function PlaybackVideo({ src, trimBefore, style }: PlaybackVideoProps) {
  const env = useRemotionEnvironment();
  const useHtml5 = env.isPlayer && !env.isClientSideRendering;

  if (useHtml5) {
    return (
      <Html5Video
        src={src}
        trimBefore={trimBefore}
        muted
        volume={0}
        pauseWhenBuffering={false}
        delayRenderTimeoutInMilliseconds={60_000}
        delayRenderRetries={8}
        style={style}
      />
    );
  }

  return (
    <MediaVideo
      src={src}
      trimBefore={trimBefore}
      muted
      volume={0}
      delayRenderTimeoutInMilliseconds={60_000}
      delayRenderRetries={8}
      style={style}
    />
  );
}
