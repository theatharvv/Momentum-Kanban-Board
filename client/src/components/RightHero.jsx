import img1 from "../images/image1.png";
import img2 from "../images/image2.png";
import img3 from "../images/image3.png";
import img4 from "../images/image4.png";

import { useEffect, useState } from "react";

const RightHero = () => {
    const images = [img1, img2, img3, img4];
    const [currentImage, setCurrentImage] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out

            setTimeout(() => {
                setCurrentImage(prev => (prev + 1) % images.length); // change image
                setFade(true); // fade in
            }, 1000); // fade out duration (1s)

        }, 2500); // total time per image (5s)

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="flex-1 h-full rounded-3xl p-4 flex items-center justify-center overflow-hidden relative"
            style={{
                background: "linear-gradient(135deg, #F26E2D, #F6A137)"
            }}
        >
            <img
                src={images[currentImage]}
                alt="Slideshow"
                className={`absolute h-full w-full object-contain transition-opacity duration-500`}
                style={{ opacity: fade ? 1 : 0 }}
            />
        </div>

    )
}

export default RightHero
