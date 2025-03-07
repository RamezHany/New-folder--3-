import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { News } from '@/interfaces/News';
import { GetServerSideProps } from 'next';
import { loadNewsData } from '@/components/home/home_news.data';

// Styled Paper for the News Detail Container
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(6),
    },
}));

interface NewsDetailProps {
    newsItem: News | null;
}

const NewsDetail: FC<NewsDetailProps> = ({ newsItem }) => {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { locale } = router;

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    if (!newsItem) {
        return (
            <Container>
                <Typography variant="h4" component="h1">
                    {t('news_not_found')}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <StyledPaper elevation={3}>
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {newsItem.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {new Date(newsItem.date).toLocaleDateString()}
                    </Typography>
                    <Divider />
                </Box>

                {newsItem.image && newsItem.image.length > 0 && (
                    <Box mb={4} sx={{ position: 'relative', width: '100%', height: '500px' }}>
                        <Image
                            src={newsItem.image[0].url}
                            alt={newsItem.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    </Box>
                )}

                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(newsItem.description) 
                        ? newsItem.description.join('\n\n')
                        : newsItem.description}
                </Typography>
            </StyledPaper>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale = 'ar' }) => {
    try {
        // Load news data using the shared function
        const newsData = await loadNewsData(locale);
        
        // Find the specific news item
        const newsItem = newsData.find((item: News) => item.slug === params?.slug);

        if (!newsItem) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                newsItem,
                ...(await serverSideTranslations(locale, ['common'])),
            },
        };
    } catch (error) {
        console.error('Error fetching news:', error);
        return {
            notFound: true
        };
    }
};

export default NewsDetail;