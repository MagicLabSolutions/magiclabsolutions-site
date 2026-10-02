# Keep existing source pages and concurrent localized work intact. Legal/support routes
# retain their own layouts; only the twelve requested product landing pages use this one.
require 'digest'
module Jekyll
  class ProductLaunch < Generator
    safe true
    priority :low
    def generate(site)
      assets = %w[css/product-launch.css js/product-launch.js]
      site.config['product_launch_asset_version'] = Digest::SHA256.hexdigest(
        assets.map { |asset| File.binread(File.join(site.source, asset)) }.join
      )[0, 12]
      products = site.data.fetch('product_launch', {})
      site.pages.each do |page|
        slug = products.keys.find { |key| page.path == "apps/#{key}/index.html" }
        next unless slug
        page.data['layout'] = 'product-launch'
        page.data['product'] = slug
      end
      # Polyglot builds each global language separately. Additional app languages
      # are generated only in the default-language process, at explicit URLs.
      return unless site.active_lang == site.default_lang
      localized = site.data.fetch('product_launch_localized', {})
      localized.each do |slug, variants|
        variants.each do |locale, _launch|
          next if locale == 'en-US' || site.languages.include?(locale)
          url = "/#{locale}/apps/#{slug}/"
          page = PageWithoutAFile.new(site, site.source, url.sub(%r{^/}, ''), 'index.html')
          page.data.merge!('layout' => 'product-launch', 'product' => slug,
            'product_locale' => locale, 'product_base_url' => "/apps/#{slug}/",
            'permalink' => url, 'lang' => site.default_lang)
          site.pages << page
        end
      end
    end
  end
end
