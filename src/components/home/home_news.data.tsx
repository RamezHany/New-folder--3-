import type { News } from '@/interfaces/News';

let dataNews: Array<News> = [];
let lastLoadedLocale: string = '';

// This function will be called to load the data
export async function loadNewsData(locale: string): Promise<News[]> {
    try {
        console.log(`Loading news data with locale: ${locale}, last loaded locale: ${lastLoadedLocale}`);
        
        // Always reload if locale changes or if it's the first load
        const shouldReload = locale !== lastLoadedLocale || dataNews.length === 0;
        
        if (shouldReload) {
            console.log(`Reloading news data for locale: ${locale}`);
            const response = await fetch('https://raw.githubusercontent.com/RamezHany/IGCCe-tr/refs/heads/main/news.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch news data');
            }
            
            const data = await response.json();
            
            // Process the data based on locale
            dataNews = data.news.map((item: any) => ({
                id: item.id,
                slug: item.slug,
                title: locale === 'ar' ? (item.title_ar || item.title) : item.title,
                title_ar: item.title_ar,
                description: locale === 'ar' ? (item.description_ar || item.description) : item.description,
                description_ar: item.description_ar,
                shortDescription: locale === 'ar' ? (item.shortDescription_ar || item.shortDescription) : item.shortDescription,
                shortDescription_ar: item.shortDescription_ar,
                image: Array.isArray(item.image) ? item.image : [{ url: item.image, width: 800, height: 600 }],
                date: item.date
            }));
            
            lastLoadedLocale = locale;
            console.log(`News data loaded successfully for locale: ${locale}, items: ${dataNews.length}`);
        } else {
            console.log(`Using cached news data for locale: ${locale}, items: ${dataNews.length}`);
        }
        
        return dataNews;
    } catch (error) {
        console.error('Error loading news data:', error);
        return [];
    }
}

// Initial load of data (optional, can be removed if not needed)
if (typeof window !== 'undefined') {
    loadNewsData('en'); // Default to English
}

export { dataNews };