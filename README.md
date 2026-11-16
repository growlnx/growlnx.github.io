# growlnx.github.io

My personal blog, where I talk about random stuff.

Built with [Jekyll](https://jekyllrb.com/) and based on the
[Minima](https://github.com/jekyll/minima) theme, using the adaptive `auto` skin
(light/dark depending on the system setting) and the `jekyll-feed` and
`jekyll-seo-tag` plugins. Hosted on GitHub Pages.

## Running locally

```bash
bundle install
bundle exec jekyll serve --livereload
```

The site will be available at <http://localhost:4000>.

## Writing a post

Create a file in `_posts/` named `YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: "My post title"
---

Content here.
```

## License

Released under the [MIT License](LICENSE.txt).
