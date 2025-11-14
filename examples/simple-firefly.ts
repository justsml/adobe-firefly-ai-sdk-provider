import { writeFileSync } from "node:fs";
import { firefly } from "adobe-firefly-ai-sdk";
import { experimental_generateImage as generateImage } from "ai";

const { images } = await generateImage({
	model: firefly.image("firefly-v3"),
	prompt: "A beautiful sunset over mountains",
	n: 2,
	size: "1024x1024",
});

console.log("Generated images:", images.length);
// Loop through images and save them to disk
images.forEach((image, index) => {
	const filePath = `/tmp/sunset_${index + 1}.png`;
	console.log(
		`Image ${index + 1} ${filePath} type: ${image.mediaType}, size: ${image.uint8Array.length}`,
	);
	writeFileSync(filePath, image.uint8Array);
});
