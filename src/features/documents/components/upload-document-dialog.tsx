"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FileUp } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { Field, FormAlert, inputClass, textareaClass } from "@/components/shared/form-controls"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { useDocumentMutations } from "../hooks/use-documents"
import { ACCEPT_ATTRIBUTE, ALLOWED_EXTENSIONS, fileExtension, formatFileSize, MAX_FILE_SIZE_BYTES } from "../lib/document-files"

const FORMATS_LABEL = ALLOWED_EXTENSIONS.map((ext) => ext.toUpperCase()).join(", ")

const uploadSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis.").max(200, "200 caractères maximum."),
  description: z.string().trim().max(1000, "1 000 caractères maximum."),
  file: z
    .custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Choisissez un fichier.")
    .refine((file) => (ALLOWED_EXTENSIONS as readonly string[]).includes(fileExtension(file.name)), `Formats acceptés : ${FORMATS_LABEL}.`)
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, `Le fichier dépasse ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`),
})
type UploadValues = z.infer<typeof uploadSchema>

export function UploadDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        {open ? <UploadForm onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const { upload } = useDocumentMutations()
  const [dragging, setDragging] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", description: "" },
  })

  const onSubmit = handleSubmit((values) => {
    upload.mutate(
      { title: values.title, description: values.description || undefined, file: values.file },
      {
        onSuccess: () => {
          toast.success("Document publié", { description: values.title })
          onDone()
        },
      }
    )
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <DialogHeader>
        <DialogTitle className="text-lg font-extrabold text-ink">Ajouter un document</DialogTitle>
        <DialogDescription>Le document sera proposé en téléchargement sur le site ToonaSHOP.</DialogDescription>
      </DialogHeader>

      {upload.isError ? <FormAlert>{getErrorMessage(upload.error)}</FormAlert> : null}

      <Field id="document-title" label="Titre" error={errors.title?.message}>
        <input
          id="document-title"
          {...register("title")}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "document-title-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="document-description" label="Description (facultative)" error={errors.description?.message}>
        <textarea
          id="document-description"
          {...register("description")}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "document-description-error" : undefined}
          className={textareaClass}
        />
      </Field>

      <Controller
        control={control}
        name="file"
        render={({ field, fieldState }) => (
          <Field id="document-file" label="Fichier" error={fieldState.error?.message}>
            <label
              htmlFor="document-file"
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                const dropped = event.dataTransfer.files[0]
                if (dropped) field.onChange(dropped)
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-surface-subtle px-4 py-6 text-center transition-colors hover:border-brand focus-within:border-brand focus-within:ring-3 focus-within:ring-ring/25",
                dragging && "border-brand bg-brand-soft",
                fieldState.error && "border-danger"
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <FileUp className="size-5" aria-hidden="true" />
              </span>
              {field.value ? (
                <span className="min-w-0 max-w-full">
                  <span className="block truncate text-[13.5px] font-bold text-ink">{field.value.name}</span>
                  <span className="block text-[12.5px] text-muted-foreground">{formatFileSize(field.value.size)} · cliquer pour changer</span>
                </span>
              ) : (
                <span className="text-[13.5px] font-semibold text-ink-soft">Glissez un fichier ou cliquez pour parcourir</span>
              )}
              <span className="text-[12px] text-muted-foreground">
                {FORMATS_LABEL} — {formatFileSize(MAX_FILE_SIZE_BYTES)} maximum
              </span>
              <input
                id="document-file"
                ref={field.ref}
                name={field.name}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.files?.[0])}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? "document-file-error" : undefined}
                className="sr-only"
              />
            </label>
          </Field>
        )}
      />

      <DialogFooter className="-mx-6 -mb-6 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={upload.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={upload.isPending}>
          {upload.isPending ? "Envoi en cours…" : "Publier le document"}
        </AppButton>
      </DialogFooter>
    </form>
  )
}
