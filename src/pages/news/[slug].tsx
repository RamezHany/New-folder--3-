import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { loadNewsData } from '@/components/home/home_news.data';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'next-i18next';
import type { News } from '@/interfaces/News';
import { GetServerSideProps } from 'next';

// Styled Paper for the News Detail Container
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper,
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
}));

interface NewsDetailProps {
    newsData: {
        id: string;
        slug: string;
        title: string;
        title_ar: string;
        content: string;
        content_ar: string;
        image: string;
    };
}

const NewsDetail: FC<NewsDetailProps> = ({ newsData }) => {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { locale } = router;
    const [currentLocale, setCurrentLocale] = useState<string | undefined>(locale);

    useEffect(() => {
        if (locale !== currentLocale) {
            setCurrentLocale(locale);
        }
    }, [locale, currentLocale]);

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    if (!newsData) {
        return (
            <Container>
                <Typography variant="h4" component="h1">
                    {t('news_not_found')}
                </Typography>
            </Container>
        );
    }

    const title = locale === 'ar' ? newsData.title_ar : newsData.title;
    const content = locale === 'ar' ? newsData.content_ar : newsData.content;

    return (
        <Container maxWidth="lg">
            <StyledPaper elevation={3}>
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {title}
                    </Typography>
                    <Divider />
                </Box>

                {newsData.image && (
                    <Box mb={4}>
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '500px',
                                objectFit: 'cover',
                                borderRadius: 1,
                                mb: 2,
                            }}
                            src={newsData.image}
                            alt={title}
                        />
                    </Box>
                )}

                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {content}
                </Typography>
            </StyledPaper>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/RamezHany/IGCCe-tr/refs/heads/main/news.json');
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        const newsItem = data.news.find((item: any) => item.slug === params?.slug);

        if (!newsItem) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                newsData: newsItem,
                ...(await serverSideTranslations(locale || 'ar', ['common'])),
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