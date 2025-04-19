<template>
    <div
        v-if="article.title"
        class="flex flex-col h-full rounded-md border-2 overflow-auto"
        style="min-height: 350px"
    >
        <div
            class="article-image"
            :class="{ 'default-image': !article.image }"
            :style="{ backgroundImage: 'url(\'' + encodeURI(article.image) + '\')' }"
        >
            <div
                class="flex items-center flex-wrap space-x-1 relative top-4 px-2 w-fit"
            >
                <Badge v-if="article.featured" variant="subtle" theme="green" size="md">
                    {{ __('Featured') }}
                </Badge>
                <div
                    v-if="article.tags"
                    v-for="tag in article.tags?.split(', ')"
                    class="text-xs bg-white text-gray-800 px-2 py-0.5 rounded-md"
                >
                    {{ tag }}
                </div>
            </div>
            <div v-if="!article.image" class="image-placeholder">
                {{ article.title[0] }}
            </div>
        </div>
        <div class="flex flex-col flex-auto p-4">
            <div class="text-xl font-semibold leading-6 text-ink-gray-9">
                {{ article.title }}
            </div>

            <div class="short-introduction text-ink-gray-7 text-sm">
                {{ article.short_description }}
            </div>

            <div class="flex items-center justify-between mt-auto">
                <div class="flex avatar-group overlap">
                    <div
                        class="h-6 mr-1"
                        :class="{ 'avatar-group overlap': article.authors.length > 1 }"
                    >
                        <UserAvatar
                            v-for="author in article.authors"
                            :user="author"
                        />
                    </div>
                    
                </div>

                <div v-if="article.published_date" class="text-sm text-ink-gray-7">
                    {{ __('Published on') }} {{ article.published_date }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import { Badge } from 'frappe-ui'
// import ArticleAuthors from '@/components/ArticleAuthors.vue'

const props = defineProps({
    article: {
        type: Object,
        default: null,
    },
})
</script>

