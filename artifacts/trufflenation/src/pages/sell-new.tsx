import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import {
  useCreateProduct,
  getListProductsQueryKey,
  useGetSellerProfile,
  getGetSellerProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";

const TRUFFLE_CATEGORIES = [
  "Black Winter Truffle",
  "Black Summer Truffle",
  "Burgundy Truffle",
  "White Alba Truffle",
  "Oregon Black Truffle",
  "Oregon White Truffle",
  "Other",
];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  pricePerGram: z.coerce.number().positive("Price must be positive"),
  weightGrams: z.coerce.number().positive("Weight must be positive"),
  stockGrams: z.coerce.number().min(0, "Stock cannot be negative"),
  origin: z.string().optional(),
  season: z.string().optional(),
  harvestDate: z.string().optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function SellNewPage() {
  const [, setLocation] = useLocation();
  const createProduct = useCreateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: sellerProfile } = useGetSellerProfile({
    query: { queryKey: getGetSellerProfileQueryKey() },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      pricePerGram: 0,
      weightGrams: 0,
      stockGrams: 0,
      origin: "",
      season: "",
      harvestDate: "",
      imageUrl: "",
      isFeatured: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    createProduct.mutate(
      { data: values },
      {
        onSuccess: (product) => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ sellerId: String(sellerProfile?.id ?? "") }) });
          toast({ title: "Listing created!", description: `${product.name} is now live on the marketplace` });
          setLocation("/sell");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create listing. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">New Listing</h1>
          <p className="text-primary-foreground/70 mt-2">Add a new truffle to your catalog</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary -ml-2 gap-2">
          <Link href="/sell"><ArrowLeft className="w-4 h-4" /> Back to Seller Hub</Link>
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Listing Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-product-name" className="rounded-none" placeholder="e.g. Black Périgord Winter Truffle" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category" className="rounded-none"><SelectValue placeholder="Select category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRUFFLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="origin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl><Input {...field} data-testid="input-origin" className="rounded-none" placeholder="e.g. Dordogne, France" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="pricePerGram" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Gram ($)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-price" type="number" step="0.01" className="rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="weightGrams" render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Weight (g)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-weight" type="number" step="1" className="rounded-none" placeholder="e.g. 50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="stockGrams" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Available (g)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-stock" type="number" step="1" className="rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="season" render={({ field }) => (
                <FormItem>
                  <FormLabel>Season</FormLabel>
                  <FormControl><Input {...field} data-testid="input-season" className="rounded-none" placeholder="e.g. Winter (Nov-Mar)" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="harvestDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Date</FormLabel>
                  <FormControl><Input {...field} data-testid="input-harvest-date" type="date" className="rounded-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-image-url" className="rounded-none" placeholder="https://..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="textarea-description" className="rounded-none min-h-[100px]" placeholder="Describe your truffle — aroma, texture, best uses..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <Button
                data-testid="button-submit-product"
                type="submit"
                className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8"
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? "Creating..." : "Create Listing"}
              </Button>
              <Button asChild type="button" variant="outline" className="rounded-none">
                <Link href="/sell">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageLayout>
  );
}
