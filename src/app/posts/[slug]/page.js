import logger from "@/logger"
import { remark } from 'remark';
import html from 'remark-html';

import styles from './page.module.css'
import { CardPost } from "@/components/CardPost";
import db from "../../../../prisma/db";
import { redirect } from "next/navigation";


async function getPostBySlug(slug) {
    try {

        const post = await db.post.findFirst({
            where: { slug },
            include: { author: true }
        });

        if (!post) {
            throw new Error('Post not found')
        }
        
        const processedContent = await remark()
            .use(html)
            .process(post.markdown);

        const contentHtml = processedContent.toString();

        post.markdown = contentHtml

        return post;
    } catch (error) {
        logger.error('Ops, alguma coisa correu mal', error);
    }
    redirect('/not-found')
}

const PagePost = async ({ params }) => {
    const post = await getPostBySlug(params.slug)
    return (<div>
        <CardPost post={post} highlight />
        <h3 className={styles.subtitle}>Código:</h3>
        <div className={styles.code}>
            <div dangerouslySetInnerHTML={{ __html: post.markdown }} />
        </div>
    </div>)
}

export default PagePost