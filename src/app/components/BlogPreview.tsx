"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";

interface PostSummary {
    id: string;
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    coverImage: string | null;
    publishedAt: string;
}

export default function BlogPreview() {
    const { t, lang } = useLanguage();
    const [posts, setPosts] = useState<PostSummary[] | null>(null);

    useEffect(() => {
        setPosts(null);
        fetch(`/api/public/blog?lang=${lang === "ar" ? "AR" : "EN"}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data: PostSummary[]) => setPosts(data.slice(0, 6)))
            .catch(() => setPosts([]));
    }, [lang]);

    const dateLocale = lang === "ar" ? "ar" : "en-US";

    return (
        <section id="blog" className="blog section-padding">
            <div className="container blog-inner">
                <div className="blog-header reveal">
                    <div className="section-label" style={{ justifyContent: "center" }}>{t.blog.label}</div>
                    <h2 className="section-title">{t.blog.title}</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.blog.subtitle}</p>
                </div>

                {posts && posts.length === 0 && <p className="blog-empty">{t.blog.empty}</p>}

                {posts && posts.length > 0 && (
                    <div className="blog-grid">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} className="blog-card" key={post.id}>
                                <div className="blog-card-cover">
                                    {post.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={post.coverImage} alt="" />
                                    ) : null}
                                </div>
                                <div className="blog-card-body">
                                    <div className="blog-meta">
                                        <span className="blog-meta-category">{post.category}</span>
                                        <span className="blog-meta-date">
                                            — {new Date(post.publishedAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>
                                    <h3 className="blog-card-title">{post.title}</h3>
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                    <span className="blog-read-more">{t.blog.readMore}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {posts && posts.length > 0 && (
                    <div className="blog-view-all">
                        <Link href="/blog" className="blog-view-all-link">{t.blog.viewAll}</Link>
                    </div>
                )}
            </div>
        </section>
    );
}
