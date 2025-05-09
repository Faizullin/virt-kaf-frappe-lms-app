<template>
    <div class="h-full">
        <div class="grid md:grid-cols-[70%,30%] h-full">
            <div>
                <header
                    class="sticky top-0 z-10 group flex flex-col md:flex-row md:items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
                    <Breadcrumbs class="h-7" :items="breadcrumbs" />
                    <div class="flex items-center mt-3 md:mt-0">
                        <Button @click="openPanelPage()">
                            Panel
                        </Button>
                        <Button @click="openDetailPage()" class="ml-2">
                            Detail
                        </Button>
                        <Button v-if="articleResource.data?.name" @click="trashArticle()"
                            class="invisible group-hover:visible ml-2">
                            <template #icon>
                                <Trash2 class="w-4 h-4 stroke-1.5" />
                            </template>
                        </Button>
                        <Button variant="solid" @click="submitArticle()" class="ml-2">
                            <span>
                                {{ __('Save') }}
                            </span>
                        </Button>
                    </div>
                </header>
                <div class="mt-5 mb-10">
                    <div class="container mb-5">
                        <div class="text-lg font-semibold mb-4">
                            {{ __('Details') }}
                        </div>
                        <FormControl v-model="article.title" :label="__('Title')" class="mb-4" :required="true" />
                        <div class="mb-4">
                            <div class="text-xs text-ink-gray-5 mb-2">
                                {{ __('Meta Image') }}
                            </div>
                            <FileUploader v-if="!article.article_meta_image" :fileTypes="['image/*']"
                                :validateFile="validateFile" @success="(file) => saveImage(file)">
                                <template v-slot="{ file, progress, uploading, openFileSelector }">
                                    <div class="flex items-center">
                                        <div class="border rounded-md w-fit py-5 px-20">
                                            <Image class="size-5 stroke-1 text-ink-gray-7" />
                                        </div>
                                        <div class="ml-4">
                                            <Button @click="openFileSelector">
                                                {{ __('Upload') }}
                                            </Button>
                                            <div class="mt-2 text-ink-gray-5 text-sm">
                                                {{ __('Appears as the meta image for the article') }}
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </FileUploader>
                            <div v-else class="mb-4">
                                <div class="flex items-center">
                                    <img :src="article.article_meta_image.file_url" class="border rounded-md w-40" />
                                    <div class="ml-4">
                                        <Button @click="removeImage()">
                                            {{ __('Remove') }}
                                        </Button>
                                        <div class="mt-2 text-ink-gray-5 text-sm">
                                            {{ __('Appears as the meta image for the article') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FormControl v-model="article.blog_intro" :label="__('Introduction')"
                            :placeholder="__('A short introduction to the article')" class="mb-4" />

                        <div class="mb-4">
                            <div class="mb-1.5 text-sm text-ink-gray-5">
                                {{ __('Content') }}
                                <span class="text-ink-red-3">*</span>
                            </div>
                            <TextEditor :content="article.content" @change="(val) => (article.content = val)"
                                :editable="true" :fixedMenu="true"
                                editorClass="prose-sm max-w-none border-b border-x bg-surface-gray-2 rounded-b-md py-1 px-2 min-h-[7rem]" />
                        </div>
                        <div class="grid grid-cols-2 gap-10 mb-4">
                            <div class="flex flex-col space-y-4">
                                <FormControl v-model="article.route" :label="__('Route')"
                                    :placeholder="__('Unique route for the article')" class="mb-4" />
                                <FormControl v-model="article.author" :label="__('Author')" class="mb-4" />
                            </div>
                            <div class="flex flex-col space-y-4">
                                <Link doctype="Blog Category" v-model="article.category" :label="__('Category')" />
                            </div>
                        </div>
                    </div>
                    <div class="container border-t">
                        <div class="text-lg font-semibold mt-5 mb-4">
                            {{ __('Settings') }}
                        </div>
                        <div class="grid grid-cols-2 gap-10 mb-4">
                            <div class="flex flex-col space-y-4">
                                <FormControl type="checkbox" v-model="article.published" :label="__('Published')" />
                                <FormControl v-model="article.published_on" :label="__('Published On')" type="datetime"
                                    class="mb-5" />
                            </div>
                            <div class="flex flex-col space-y-3">
                                <FormControl type="checkbox" v-model="article.featured" :label="__('Featured')" />
                                <FormControl type="checkbox" v-model="article.is_free" :label="__('Is Free')" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Link from '@/components/Controls/Link.vue'
import { showToast, updateDocumentTitle } from '@/utils'
import {
    Breadcrumbs,
    Button,
    createResource,
    FileUploader,
    FormControl,
    TextEditor,
} from 'frappe-ui'
import { Image, Trash2 } from 'lucide-vue-next'
import {
    computed, getCurrentInstance,
    onBeforeUnmount,
    onMounted,
    reactive,
    watch,
} from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    articleID: {
        type: String,
    },
})

const router = useRouter()
const app = getCurrentInstance()
const { $dialog } = app.appContext.config.globalProperties

const article = reactive({
    title: '',
    blog_intro: '',
    content: '',
    article_meta_image: null,
    route: '',
    author: '',
    category: '',
    published: false,
    published_on: '',
    featured: false,
    is_free: false,
})

const articleResource = createResource({
    url: 'frappe.client.get',
    makeParams(values) {
        return {
            doctype: 'CArticle',
            name: props.articleID,
        }
    },
    auto: false,
    onSuccess(data) {
        Object.keys(data).forEach((key) => {
            if (Object.hasOwn(article, key)) article[key] = data[key]
        })
		if (data.meta_image) imageResource.reload({ image: data.meta_image })
    },
})

const imageResource = createResource({
    url: 'lms.lms.api.get_file_info',
    makeParams(values) {
        return {
            file_url: values.image,
        }
    },
    auto: false,
    onSuccess(data) {
        article.article_meta_image = data
    },
})



// Resource to create an article
const articleCreationResource = createResource({
    url: 'frappe.client.insert',
    makeParams(values) {
        return {
            doc: {
                doctype: 'CArticle',
                meta_image: article.article_meta_image?.file_url || '',
                ...values,
            },
        }
    },
})
// Resource to update an article
const articleEditResource = createResource({
    url: 'frappe.client.set_value',
    auto: false,
    makeParams(values) {
        return {
            doctype: 'CArticle',
            name: values.articleID,
            fieldname: {
                meta_image: article.article_meta_image?.file_url || '',
                ...article,
            },
        }
    },
})


// Resource to delete an article
const deleteArticle = createResource({
    url: 'lms.lms.api.delete_article',
    makeParams() {
        return {
            article: props.articleID,
        }
    },
    onSuccess() {
        showToast('Success', 'Article deleted successfully', 'check')
        router.push({ name: 'Articles' })
    },
})

// Fetch data if not new
onMounted(() => {
    if (props.articleID !== 'new') {
        articleResource.reload()
    }
})

onBeforeUnmount(() => {
    // Clean up listeners or other resources if needed
})

watch(
    () => props.articleID,
    (newVal) => {
        if (newVal && newVal !== 'new') articleResource.reload()
    }
)


const submitArticle = () => {
    if (articleResource.data) {
        articleEditResource.submit(
            {
                articleID: articleResource.data.name,
            },
            {
                onSuccess() {
                    showToast('Success', 'Article updated successfully', 'check')
                },
                onError(err) {
                    showToast('Error', err.messages?.[0] || err, 'x')
                },
            }
        );
    } else {
        articleCreationResource.submit(article, {
            onSuccess(data) {
                showToast('Success', 'Article created successfully', 'check')
                router.push({
                    name: 'ArticleForm',
                    params: { articleID: data.name },
                })
            },
            onError(err) {
                showToast('Error', err.messages?.[0] || err, 'x')
            },
        })
    }
}

const trashArticle = () => {
    $dialog({
        title: 'Delete Article',
        message: 'Are you sure you want to delete this article?',
        actions: [
            {
                label: 'Delete',
                theme: 'red',
                variant: 'solid',
                onClick(close) {
                    deleteArticle.submit()
                    close()
                },
            },
        ],
    })
}

const openPanelPage = () => {
    if(articleResource.data) {
        window.location.href=`/app/carticle/${articleResource.data?.name}`;
    }
}

const openDetailPage = () => {
    if(articleResource.data) {
        window.location.href=`/${articleResource.data?.route}`;
    }
}


const validateFile = (file) => {
    let extension = file.name.split('.').pop().toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        return __('Only image files are allowed.')
    }
}

const saveImage = (file) => {
    article.article_meta_image = file
}

const removeImage = () => {
    article.article_meta_image = null
}

const breadcrumbs = computed(() => [
    {
        label: 'Articles',
        route: { name: 'Articles' },
    },
    {
        label: props.articleID === 'new' ? 'New Article' : 'Edit Article',
        route: { name: 'ArticleForm', params: { articleID: props.articleID } },
    },
])

const pageMeta = computed(() => {
    return {
        title: props.articleID === 'new' ? 'Create an Article' : 'Edit Article',
        description: 'Create or edit an article for your blog.',
    }
})

updateDocumentTitle(pageMeta)

</script>