import React, { useState, useEffect } from "react";
import { ARR_DEFAULT_16_IMGS } from "./resources";
import "./style.scss";

type Props = {
  imgs?: any;
  initAngleImge?: number;
  width?: string;
};

const FollowingTheCursor: React.FC<Props> = ({ imgs = ARR_DEFAULT_16_IMGS, initAngleImge = 0, width = "150px" }) => {
  const imgObj = React.createRef() as any;
  const [imgSelected, setImgSelected] = useState(imgs[0]);
  const [cursorPosition, setCursorPosition] = useState({ px: 0, py: 0 });
  const [imgsData, setImgData] = useState([]);

  const [centAbs, setCentAbs] = useState({ cx: 0, cy: 0 });

  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    setImgData(
      imgs.map((e: any, i: any) => {
        const eachPortion = 2 / imgs.length; // 2PI = 360º.
        return {
          image: e,
          range: [initAngleImge + eachPortion * i, initAngleImge + eachPortion * (i + 1)],
        };
      })
    );

    setMouseEvent();

    if (imgObj.current) {
      const cumulativeOffset = (domElement: any) => {
        const { width, height } = domElement;

        let top = 0,
          left = 0;
        do {
          const { offsetTop, offsetLeft, offsetParent } = domElement;
          top += offsetTop || 0;
          left += offsetLeft || 0;
          domElement = offsetParent;
        } while (domElement);

        return {
          width,
          height,
          offsetTop: top,
          offsetLeft: left,
        };
      };

      const { width, height, offsetLeft, offsetTop } = cumulativeOffset(imgObj.current);

      setCentAbs({ cx: offsetLeft + width / 2, cy: offsetTop + height / 2 });
    }
  }, []);

  useEffect(() => {
    if (imgsData.length > 0) {
      getPicture();
      plotTracking();
    }
  }, [cursorPosition]);

  const setMouseEvent = () => {
    const handleMouseMove = (event: any) => {
      let eventDoc, doc, body;

      event = event || window.event;

      if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX =
          event.clientX +
          ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
          ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
        event.pageY =
          event.clientY +
          ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
          ((doc && doc.clientTop) || (body && body.clientTop) || 0);
      }

      setCursorPosition({ px: event.pageX, py: event.pageY });
    };

    document.addEventListener("mousemove", handleMouseMove);
  };

  const plotTracking = () => {
    if (tracking) {
      const { px, py } = cursorPosition;
      //localStorage.setItem("mouseTracked", [px, py, Date.now().toString()]);
      console.log(px, py, Date.now().toString());
    }
  };

  const getPicture = () => {
    const angleRad = (2 - Math.atan2(cursorPosition.py - centAbs.cy, cursorPosition.px - centAbs.cx) / Math.PI) % 2;
    if (angleRad > 2 + initAngleImge) {
      setImgSelected((imgsData[0] as any).image);
    } else {
      setImgSelected(
        (imgsData.find((e: any) => {
          const [min, max] = e.range;
          return angleRad >= min && angleRad < max;
        }) as any).image
      );
    }
  };

  return (
    <div className="cursor_image" onClick={() => setTracking(!tracking)}>
      <img ref={imgObj} className="img-pdf" src={imgSelected} alt="" style={{ maxWidth: "100%", width: width }} />
    </div>
  );
};

export default FollowingTheCursor;
