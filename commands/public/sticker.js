// No dotenv needed - config handles everything
import { downloadMediaMessage } from "baileys";
import Jimp from "jimp";
import memoryManager from "../../functions/memoryUtils.js";

import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { writeFile } from "fs/promises";
import { getMemberData, member } from "../../mongo-DB/membersDataDb.js";

// Get FFMPEG path from config (set in environment)
let ffmpegPath1 = process.env.FFMPEG_PATH;

if (!ffmpegPath1) {
    try {
        const { default: ffmpegStatic } = await import("ffmpeg-static");
        const { existsSync } = await import("fs");
        ffmpegPath1 = (ffmpegStatic && existsSync(ffmpegStatic)) ? ffmpegStatic : "ffmpeg";
    } catch (err) {
        ffmpegPath1 = "ffmpeg";
    }
}

console.log(`🎬 Sticker command using FFmpeg: ${ffmpegPath1}`);
ffmpeg.setFfmpegPath(ffmpegPath1);

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const getRandom = (ext = "") => memoryManager.generateTempFileName(ext);
    const { senderJid, type, content, isGroup, sendMessageWTyping, evv } = msgInfoObj;
    const memberData = await getMemberData(senderJid);

    if (msg.message.extendedTextMessage) {
        msg.message = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    }

    const isMedia = type === "imageMessage" || type === "videoMessage";
    const isTaggedImage = type === "extendedTextMessage" && content.includes("imageMessage");
    const isTaggedVideo = type === "extendedTextMessage" && content.includes("videoMessage");

    if (!isGroup) {
        if (memberData.dmLimit <= 0) {
            return sendMessageWTyping(
                from,
                { text: "You have used your monthly limit.\nWait for next month." },
                { quoted: msg }
            );
        }
        member.updateOne({ _id: senderJid }, { $inc: { dmLimit: -1 } });
    }

    let packName = memberData ? await memberData?.customStealText : "eva";
    let authorName = memberData?.customStealText ? undefined : "jacktheboss220";

    const isPackIncluded = args.includes("pack");
    const isAuthorIncluded = args.includes("author");

    if (args.includes("nometadata") === false) {
        packName = isPackIncluded ? evv.split("pack")[1].split("author")[0] : packName;
        authorName = isAuthorIncluded ? evv.split("author")[1].split("pack")[0] : authorName;
    }

    const outputOptions = args.includes("crop") || args.includes("c")
        ? [
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
                `-loop`,
                `0`,
                `-ss`,
                `00:00:00.0`,
                `-t`,
                `00:00:09.0`,
                `-preset`,
                `default`,
                `-an`,
                `-vsync`,
                `0`,
                `-s`,
                `512:512`,
            ]
        : [
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(220,iw)':min'(220,ih)':force_original_aspect_ratio=decrease,fps=15, pad=220:220:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ];

    const media = isTaggedImage ? getRandom(".png") : getRandom(".mp4");

    if (isMedia || isTaggedImage || isTaggedVideo) {
        if (msg.message?.videoMessage?.seconds > 11) {
            return sendMessageWTyping(from, { text: "Send less than 11 seconds." }, { quoted: msg });
        }

        try {
            const buffer = await downloadMediaMessage(msg, "buffer", {});
            if (!buffer || buffer.length === 0) {
                return sendMessageWTyping(
                    from,
                    { text: "❌ Failed to download media. Please try again." },
                    { quoted: msg }
                );
            }

            await writeFile(media, buffer);

            if (!fs.existsSync(media)) {
                return sendMessageWTyping(
                    from,
                    { text: "❌ Failed to save media file. Please try again." },
                    { quoted: msg }
                );
            }

            // For images, use Jimp (no sharp needed!)
            if (isTaggedImage || type === "imageMessage") {
                await buildStickerWithJimp(media);
            } else {
                // For videos, use ffmpeg (no sharp needed!)
                await buildStickerWithFFmpeg(media);
            }
        } catch (error) {
            console.error("Media download error:", error);
            memoryManager.safeUnlink(media);
            return sendMessageWTyping(from, { text: "❌ Failed to process media. Please try again." }, { quoted: msg });
        }
    } else {
        sendMessageWTyping(from, { text: `❌ *Error reply to image or video only*` }, { quoted: msg });
        console.error("Error not replied");
    }

    // NEW: Image sticker using Jimp (no sharp/wa-sticker-formatter)
    async function buildStickerWithJimp(media) {
        const ran = getRandom(".webp");
        
        try {
            if (!fs.existsSync(media)) {
                throw new Error("Input media file not found");
            }

            // Read image with Jimp
            let image = await Jimp.read(media);
            
            // Resize to standard sticker size (512x512)
            image.resize(512, 512);
            
            // Convert to WebP format (WhatsApp stickers use WebP)
            const stickerBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
            
            // Save as WebP file
            await writeFile(ran, stickerBuffer);
            
            // Send the sticker
            if (fs.existsSync(ran)) {
                await sendMessageWTyping(from, { sticker: ran }, { quoted: msg });
            } else {
                throw new Error("Sticker file not created");
            }
        } catch (error) {
            console.error("Jimp sticker error:", error);
            await sendMessageWTyping(from, { text: "❌ Failed to create image sticker." }, { quoted: msg });
        } finally {
            // Cleanup
            memoryManager.safeUnlink(media);
            memoryManager.safeUnlink(ran);
        }
    }

    // Video sticker using FFmpeg (kept as is, no sharp needed)
    async function buildStickerWithFFmpeg(media) {
        const ran = getRandom(".webp");

        try {
            if (!fs.existsSync(media)) {
                throw new Error("Input media file not found");
            }

            const file = ffmpeg(media)
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    memoryManager.safeUnlink(media);
                    memoryManager.safeUnlink(ran);
                    sendMessageWTyping(from, { text: "❌ Error converting video to sticker." }, { quoted: msg });
                })
                .addOutputOptions(outputOptions)
                .toFormat("webp")
                .save(ran);

            file.on("end", async () => {
                try {
                    if (!fs.existsSync(ran)) {
                        throw new Error("Output sticker file not created");
                    }

                    // Send sticker directly (no wa-sticker-formatter needed)
                    await sendMessageWTyping(from, { sticker: ran }, { quoted: msg });
                } catch (wsError) {
                    console.error("Sticker sending error:", wsError);
                    sendMessageWTyping(from, { text: "❌ Failed to create video sticker." }, { quoted: msg });
                } finally {
                    memoryManager.safeUnlink(media);
                    memoryManager.safeUnlink(ran);
                }
            });
        } catch (err) {
            console.error("buildStickerWithFFmpeg error:", err);
            sendMessageWTyping(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
            memoryManager.safeUnlink(media);
            memoryManager.safeUnlink(ran);
        }
    }
};

export default () => ({
    cmd: ["sticker", "s"],
    desc: "Convert image or video to sticker.",
    usage: "sticker | s [pack <packname>] [author <authorname>] [crop/c] [nometadata]",
    handler,
});
