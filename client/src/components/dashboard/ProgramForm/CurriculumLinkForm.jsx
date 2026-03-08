import { useState } from "react";
import { Button, HStack, Input } from "@chakra-ui/react";

export function CurriculumLinkForm({ formState, setFormData }) {
  const [link, setLink] = useState("");
  const [display, setDisplay] = useState("");

  function handleSubmit() {
    if (!link?.trim()) return;

    let validLink = link.trim();
    if (
      !validLink.startsWith("http://") &&
      !validLink.startsWith("https://")
    ) {
      validLink = "https://" + validLink;
    }

    const alreadyAdded = (formState.curriculumLinks ?? []).some(
      (p) => p.link === validLink
    );
    if (alreadyAdded) return;

    setFormData((prevData) => ({
      ...prevData,
      curriculumLinks: [
        ...(prevData.curriculumLinks ?? []),
        {
          link: validLink,
          name: (display || "Playlist").trim() || "Playlist",
        },
      ],
    }));

    setLink("");
    setDisplay("");
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
    >
      <Input
        placeholder="Link"
        value={link || ""}
        onChange={(e) => setLink(e.target.value)}
      />
      <Input
        placeholder="Display Name"
        value={display || ""}
        onChange={(e) => setDisplay(e.target.value)}
      />
      <Button onClick={handleSubmit}>+ Add</Button>
    </HStack>
  );
}
