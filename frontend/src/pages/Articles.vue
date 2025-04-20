<template>
    <header
        class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5"
    >
        <Breadcrumbs :items="breadcrumbs" />
        <router-link
            v-if="user.data?.is_moderator"
            :to="{
                name: 'ArticleForm',
                params: { articleID: 'new' },
            }"
        >
            <Button variant="solid">
                <template #prefix>
                    <Plus class="h-4 w-4 stroke-1.5" />
                </template>
                {{ __('New') }}
            </Button>
        </router-link>
    </header>
    <div class="p-5 pb-10">
        <div
            class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between mb-5"
        >
            <div class="text-lg text-ink-gray-9 font-semibold">
                {{ __('All Articles') }}
            </div>
            <div
                class="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4"
            >
                <TabButtons :buttons="articleTabs" v-model="currentTab" />
                <div class="grid grid-cols-2 gap-2">
                    <FormControl
                        v-model="title"
                        :placeholder="__('Search by Title')"
                        type="text"
                        class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40"
                        @input="updateArticles()"
                    />
                    <div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
                        <Select
                            v-if="categories.length"
                            v-model="currentCategory"
                            :options="categories"
                            :placeholder="__('Category')"
                            @change="updateArticles()"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="articles.data?.length"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
        >
            <!-- <router-link
                v-for="article in articles.data"
                :to="{ name: 'ArticleDetail', params: { articleID: article.name } }"
            >
                <ArticleCard :article="article" />
            </router-link> -->
            <a 
                v-for="article in articles.data"
                :href="`${article.route}`"
                target="_blank"
                rel="noopener noreferrer"
            >
                <ArticleCard :article="article" />
            </a>
        </div>
        <div
            v-else-if="!articles.list.loading"
            class="flex flex-col items-center justify-center text-sm text-ink-gray-5 italic mt-48"
        >
            <BookOpen class="size-10 mx-auto stroke-1 text-ink-gray-4" />
            <div class="text-lg font-medium mb-1">
                {{ __('No articles found') }}
            </div>
            <div class="leading-5 w-2/5 text-center">
                {{
                    __(
                        'There are no articles matching the criteria. Keep an eye out, fresh content is on the way soon!'
                    )
                }}
            </div>
        </div>
        <div
            v-if="!articles.list.loading && articles.hasNextPage"
            class="flex justify-center mt-5"
        >
            <Button @click="articles.next()">
                {{ __('Load More') }}
            </Button>
        </div>
    </div>
</template>

<script setup>
import {
    Breadcrumbs,
    Button,
    createListResource,
    FormControl,
    Select,
    TabButtons,
} from 'frappe-ui'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { BookOpen, Plus } from 'lucide-vue-next'
import { updateDocumentTitle } from '@/utils'
import ArticleCard from '@/components/ArticleCard.vue'

const user = inject('$user')
const dayjs = inject('$dayjs')
const start = ref(0)
const pageLength = ref(30)
const categories = ref([])
const currentCategory = ref(null)
const title = ref('')
const filters = ref({})
const currentTab = ref('Live')

onMounted(() => {
    setFiltersFromQuery()
    updateArticles()
    categories.value = [
        {
            label: '',
            value: null,
        },
    ]
})

const setFiltersFromQuery = () => {
    let queries = new URLSearchParams(location.search)
    title.value = queries.get('title') || ''
    currentCategory.value = queries.get('category') || null
}

const articles = createListResource({
    doctype: 'CArticle',
    url: 'lms.lms.utils.get_articles',
    cache: ['articles', user.data?.name],
    pageLength: pageLength.value,
    start: start.value,
    onSuccess(data) {
        console.log("articles.onSuccess", data)
        // let allCategories = data.map((article) => article.category)
        // allCategories = allCategories.filter(
        //     (category, index) => allCategories.indexOf(category) === index && category
        // )
        // if (categories.value.length <= allCategories.length) {
        //     updateCategories(data)
        // }
    },
})

const updateArticles = () => {
    console.log("updateArticles", currentTab.value)
    updateFilters()
    articles.update({
        filters: filters.value,
    })
    articles.reload()
}

const updateFilters = () => {
    updateCategoryFilter()
    updateTitleFilter()
    setQueryParams()
}

const updateCategoryFilter = () => {
    if (currentCategory.value) {
        filters.value['category'] = currentCategory.value
    } else {
        delete filters.value['category']
    }
}

const updateTitleFilter = () => {
    if (title.value) {
        filters.value['title'] = ['like', `%${title.value}%`]
    } else {
        delete filters.value['title']
    }
}

const setQueryParams = () => {
    let queries = new URLSearchParams(location.search)
    let filterKeys = {
        title: title.value,
        category: currentCategory.value,
    }

    Object.keys(filterKeys).forEach((key) => {
        if (filterKeys[key]) {
            queries.set(key, filterKeys[key])
        } else {
            queries.delete(key)
        }
    })

    let queryString = ''
    if (queries.toString()) {
        queryString = `?${queries.toString()}`
    }

    history.replaceState({}, '', `${location.pathname}${queryString}`)
}

const updateCategories = (data) => {
    data.forEach((article) => {
        if (
            article.category &&
            !categories.value.find((category) => category.value === article.category)
        )
            categories.value.push({
                label: article.category,
                value: article.category,
            })
    })
}

watch(currentTab, () => {
    updateArticles()
})

const articleTabs = computed(() => {
    let tabs = [
        {
            label: __('Live'),
        },
        // {
        //     label: __('New'),
        // },
        // {
        //     label: __('Upcoming'),
        // },
    ]
    if (user.data?.is_moderator) {
        tabs.push({ label: __('Created') })
    }
    return tabs
})

const breadcrumbs = computed(() => [
    {
        label: __('Articles'),
        route: { name: 'Articles' },
    },
])

const pageMeta = computed(() => {
    return {
        title: 'Articles',
        description: 'All published articles.',
    }
})

updateDocumentTitle(pageMeta)
</script>