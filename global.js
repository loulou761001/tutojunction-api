const nodemailer = require("nodemailer");
global.siteUrl = "http://localhost:3000/";
global.transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TutoJunction@gmail.com",
    pass: "xnqd pmpd lcxw ywjv",
  },
});

global.cleanXss = function (content) {
  // Array of unwanted HTML tags
  const unwantedTags = ["script", "body", "iframe", "object", "embed", "form"];
  unwantedTags.forEach((tag) => {
    const tagRegex = new RegExp(
      `<${tag}(?![\\w-])[^>]*>.*?</${tag}(?![\\w-])>`,
      "gi"
    );
    content = content.replace(tagRegex, "");
  });
  // Array of unwanted HTML attributes
  const unwantedAttrs = [
    "onload",
    "onunload",
    "onclick",
    "ondblclick",
    "onmousedown",
    "onmouseup",
    "onmouseover",
    "onmousemove",
    "onmouseout",
    "onfocus",
    "onblur",
    "onkeypress",
    "onkeydown",
    "onkeyup",
    "onsubmit",
    "onreset",
    "onselect",
    "onchange",
  ];
  unwantedAttrs.forEach((attr) => {
    const attrRegex = new RegExp(`${attr}="[^"]*"`, "gi");
    content = content.replace(attrRegex, "");
  });
  return content;
};
