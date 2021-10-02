import { Post, PostService } from "eliasneto-sdk";
import { DiscussionEmbed } from "disqus-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ParsedUrlQuery } from "querystring";
import Markdown from "../../../components/Markdown";
import PostHeader from "../../../components/PostHeader";


interface PostProps extends NextPageProps {
    post?: Post.Detailed;
    host?: string;
}

export default function PostPage(props: PostProps) {
    const { post } = props;
    return (
        <>
            <Head>
                <meta property="og:title" content={post?.title} />
                <meta property="og:site_name" content="UaiGrãos" />
                <meta property="og:url" content="uaigraos.com.br" />
                <meta property="og:description" content={post?.body.slice(0, 54)} />
                <meta property="og:type" content="article" />
                <meta property="og:image" content={post?.imageUrls.medium} />
                <title>{post?.title} - uaiGrãos</title>
                <link
                    rel="canonical"
                    href={`http://${props.host}/${props.post?.id}/${props.post?.slug}`}
                />
            </Head>
            {post && (
                <>
                    <PostHeader
                        thumbnail={post?.imageUrls.large}
                        createdAt={post?.createdAt}
                        editor={post?.editor}
                        title={post?.title}
                    />
                    <Markdown>{post.body}</Markdown>
                    <DiscussionEmbed 
                        shortname="uaigraos"
                        config={{
                            url: `http://${props.host}/${props.post?.id}/${props.post?.slug}`,
                            identifier: String(post.id),
                            title: post.title,
                            language: "pt_BR",
                        }}
                    />
                </>
            )}
        </>
    );
}

interface Params extends ParsedUrlQuery {
    id: string;
    slug: string;
}

export const getServerSideProps: GetServerSideProps<PostProps, Params> =
    async ({ params, res, req }) => {
        try {
            if (!params) return { notFound: true };

            const { id, slug } = params;
            const postId = Number(id);

            if (isNaN(postId)) return { notFound: true };

            const post = await PostService.getExistingPost(postId);

            return {
                props: {
                    post,
                    host: req.headers.host,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                props: {
                    error: {
                        message: error.message,
                        statusCode: error.data?.status || 500,
                    },
                },
            };
        }
    };
