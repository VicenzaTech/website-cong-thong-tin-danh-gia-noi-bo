"use client";

import { BieuMauFormBuilder } from "@/features/forms/BieuMauFormBuilder";
import { use } from "react";

export default function ChinhSuaBieuMauPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BieuMauFormBuilder bieuMauId={id} />;
}

