

export interface GetPagePayload {
  uri: string;
  target?: string;
}



export interface PageCaptureOverride {
  pattern: string;
  content: string;
  header?: string;
}

const overrides = [
  {
    pattern: '\\w+.wikipedia.org/wiki/\\w+',
    content: '#bodyContent',
    header: '#content > .mw-body-header h1',
  }
];

export const toGetPagePayload = (uri = ""):GetPagePayload => {
  const override = overrides.find(row => new RegExp(row.pattern, 'i').test(uri));
  if (override) {
    const targetParts = [override.content];
    if (override.header) {
      targetParts.unshift(override.header);
    }
    const target = targetParts.join("/");
    return { uri, target };
  } else {
    return { uri };
  }
}