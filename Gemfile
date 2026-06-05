source "https://rubygems.org"

# Specify minimum Ruby version for compatibility
ruby "~> 3.2"

# Specify Bundler version (matches the one in GitHub Actions)
gem "bundler", "~> 2.4.10"

# Use GitHub Pages for deployment
gem "github-pages", group: :jekyll_plugins
gem "webrick", "~> 1.8"  # Needed for Ruby version 3.0+

# Optional but recommended plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17.0"
  gem "jekyll-sitemap", "~> 1.4.0"
  gem "jekyll-seo-tag", "~> 2.8.0"
  gem "jekyll-remote-theme"
end