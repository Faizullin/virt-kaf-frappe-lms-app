
import frappe
from frappe import _
from frappe.cache_manager import clear_doctype_map, get_doctype_map
from frappe.desk.form import assign_to
from frappe.model import log_types
from frappe.model.document import Document
from frappe.utils.data import comma_and
from frappe.website.website_generator import WebsiteGenerator
from frappe.utils import (
cint,
get_fullname,
global_date_format,
markdown,
sanitize_html,
strip_html_tags,
today,
)
from frappe.website.utils import (
clear_cache,
find_first_image,
get_comment_list,
get_html_content_based_on_type,
)
from ...utils import generate_slug, validate_image

class CArticle(WebsiteGenerator):
    website = frappe._dict(
        template = "templates/generators/carticle.html",
        condition_field = "published",
        page_title_field = "title",
    )
    
    @frappe.whitelist()
    def make_route(self):
        if not self.route:
            return f"carticles/{self.scrub(self.title)}"
            # return (
            # 	frappe.db.get_value("Blog Category", self.blog_category, "route")
            # 	+ "/"
            # 	+ self.scrub(self.title)
            # )

    def validate(self):
        super().validate()
        self.validate_published()
        self.meta_image = validate_image(self.meta_image)

        if not self.blog_intro:
            content = get_html_content_based_on_type(self, "content", self.content_type)
            self.blog_intro = content[:200]
            self.blog_intro = strip_html_tags(self.blog_intro)
            
        if self.blog_intro:
            self.blog_intro = self.blog_intro[:200]

        # if not self.meta_title:
        # 	self.meta_title = self.title[:60]
        # else:
        # 	self.meta_title = self.meta_title[:60]

        # if not self.meta_description:
        # 	self.meta_description = self.blog_intro[:140]
        # else:
        # 	self.meta_description = self.meta_description[:140]

        if self.featured:
            if not self.meta_image:
                frappe.throw(_("A featured post must have a cover image"))
            # self.reset_featured_for_other_blogs()

        # self.set_read_time()

        # if self.is_website_published():
        # 	from frappe.core.doctype.file.utils import extract_images_from_doc

        # 	# Extract images first before the standard image extraction to ensure they are public.
        # 	extract_images_from_doc(self, "content", is_private=False)
        # 	extract_images_from_doc(self, "content_md", is_private=False)
    
    def validate_published(self):
        if self.published and not self.published_on:
            self.published_on = today()