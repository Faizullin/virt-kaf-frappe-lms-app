import frappe

def get_context(context):
    # 1) Get the search text from the query string (?search=...), default empty
    search_query = frappe.form_dict.get("search", "")

    # 2) Determine current page, default to 1 if not provided
    page = frappe.form_dict.get("page")
    if not page or not page.isdigit():
        page = 1
    else:
        page = int(page)

    # 3) Set pagination parameters
    page_length = 5   # Number of articles per page
    start = (page - 1) * page_length

    # 4) Build filters. If search_query is provided, filter titles by "LIKE" search
    filters = {}
    if search_query:
        filters["title"] = ["like", f"%{search_query}%"]

    # 5) Get total count of matching articles (for pagination)
    total_records = frappe.db.count("CArticle", filters=filters)

    # 6) Fetch articles (only the fields you actually need)
    articles = frappe.get_all(
        "CArticle",
        filters=filters,
        fields=["name", "title", "blog_intro", "modified", "route", "meta_image"],
        order_by="modified desc",
        start=start,
        page_length=page_length
    )

    # 7) Calculate total pages (ceiling division)
    total_pages = (total_records + page_length - 1) // page_length

    # 8) Put data into context for use in articles.html
    context.articles = articles
    context.search = search_query
    context.current_page = page
    context.page_length = page_length
    context.total_records = total_records
    context.total_pages = total_pages

    return context
