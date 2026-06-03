export const sanitizeRenderedHtml = async (html: string): Promise<string> => {
  const { default: filterXSS } = await import("xss");
  return filterXSS(html, {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      em: [],
      code: [],
      pre: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      ul: [],
      ol: [],
      li: [],
      blockquote: [],
      a: ["href", "title", "target"],
      img: ["src", "alt", "title", "loading", "decoding", "class"],
      span: ["class", "id"],
      div: ["class", "id", "data-id"],
      iframe: ["src", "allowfullscreen", "frameborder", "title", "allow"],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
};
