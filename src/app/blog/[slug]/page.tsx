"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageContext";

interface Post {
    id: string;
    slug: string;
    title: string;
    category: string;
    body: string;
    coverImage: string | null;
    publishedAt: string;
    lang: "EN" | "AR";
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { t, lang } = useLanguage();
    const [post, setPost] = useState<Post | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setPost(null);
        setNotFound(false);
        fetch(`/api/public/blog/${slug}`)
            .then(async (res) => {
                if (!res.ok) { setNotFound(true); return; }
                setPost(await res.json());
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    const dateLocale = lang === "ar" ? "ar" : "en-US";

    if (notFound) {
        return (
            <section className="blog standalone-page section-padding">
                <div className="container article">
                    <Link href="/blog" className="article-back">← {t.blog.back}</Link>
                    <p>{t.blog.empty}</p>
                </div>
            </section>
        );
    }

    if (!post) {
        return <section className="blog standalone-page section-padding" />;
    }

    return (
        <section className="blog standalone-page section-padding">
            <div className="container article">
                <Link href="/blog" className="article-back">← {t.blog.back}</Link>

                <div className="blog-meta">
                    <span className="blog-meta-category">{post.category}</span>
                    <span className="blog-meta-date">
                        — {new Date(post.publishedAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                <h1 className="article-title">{post.title}</h1>

                {post.coverImage && (
                    <div className="article-cover">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.coverImage} alt="" />
                    </div>
                )}

                <div className="article-body">
                    {post.body.split(/\n{2,}/).map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}
