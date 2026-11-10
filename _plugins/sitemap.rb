require "yaml"
require "date"

# Polyglot filters `site.projects` by language, so a Liquid sitemap cannot see
# both languages at once. Read the project front matter directly and emit one
# sitemap with the English and Spanish URLs.
Jekyll::Hooks.register :site, :post_write do |site|
  base = site.config["url"].to_s
  entries = [
    "#{base}/",
    "#{base}/es/",
    "#{base}/cleanyourmail/",
    "#{base}/assets/pdf/resume.pdf",
  ]

  Dir.glob(File.join(site.source, "_projects", "*.md")).sort.each do |file|
    raw = File.read(file)
    next unless raw =~ /\A---\s*\n(.*?)\n---/m

    data = YAML.safe_load(Regexp.last_match(1), permitted_classes: [Date, Time], aliases: true) || {}
    permalink = data["permalink"]
    next unless permalink

    prefix = data["lang"] == "es" ? "/es" : ""
    entries << "#{base}#{prefix}#{permalink}"
  end

  xml = +"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  xml << "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
  entries.uniq.each { |url| xml << "  <url><loc>#{url}</loc></url>\n" }
  xml << "</urlset>\n"

  File.write(File.join(site.dest, "sitemap.xml"), xml)
end
