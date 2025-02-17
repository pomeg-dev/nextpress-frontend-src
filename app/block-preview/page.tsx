"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const BlockPreview = () => {
  const searchParams = useSearchParams();
  const blockName = searchParams.get("block");
  const attributes = searchParams.get("attributes")
    ? JSON.parse(decodeURIComponent(searchParams.get("attributes")!))
    : {};

  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blockName) return;

    const loadBlock = async () => {
      const blockParts = blockName.split('--');
      const theme = blockParts[0];
      const file = blockParts[1];
      console.log('Block module:', theme, file);

      try {
        // const blockModule = await import(`../../../themes/${theme}/blocks/${file}`);
        // console.log('Block module:', blockModule);
        // setComponent(() => blockModule[blockParts[1]] || blockModule.default);
        // setLoading(false);
      } catch (err) {
        console.error("Error fetching block:", err);
        setLoading(false);
      }
    };

    loadBlock();
  }, [blockName]);

  if (loading) return <div>Loading preview...</div>;
  if (!Component) return <div>Failed to load block.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <Component {...attributes} />
    </div>
  );
};

export default BlockPreview;
