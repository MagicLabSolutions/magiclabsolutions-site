# Keep existing source pages and concurrent localized work intact. Legal/support routes
# retain their own layouts; only the twelve requested product landing pages use this one.
module Jekyll
  class ProductLaunch < Generator
    safe true
    priority :low
    def generate(site)
      products = site.data.fetch('product_launch', {})
      site.pages.each do |page|
        slug = products.keys.find { |key| page.path == "apps/#{key}/index.html" }
        next unless slug
        page.data['layout'] = 'product-launch'
        page.data['product'] = slug
      end
    end
  end
end
