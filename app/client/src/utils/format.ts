//this function replaces the first word character of each word with its capitalised form and replaces any
//underscores with a space
export const format_label = (text: string) =>
  text.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
