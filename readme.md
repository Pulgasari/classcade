# classcade

##

### node

```javascript
const html = await fs.readFile("index.html", "utf8");
const css  = classcade.compile(html);

await fs.writeFile("classcade.css", css);
```

### deno

```javascript
const html = await Deno.readTextFile("index.html");
const css  = classcade.compile(html);

await Deno.writeTextFile("classcade.css", css);
```

### browser

```javascript
const html = document.documentElement.outerHTML;
const css  = classcade.compile(html);
```

### vite

```javascript
transform (html) {
  return classcade.compile(html);
}
```

### rollup

```javascript
transform (html) {
  return classcade.compile(html);
}
```
