import { useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useParams } from "wouter";
import {
  useGetProduct,
  getGetProductQueryKey,
  getListProductsQueryKey,
  useUpdateProduct,
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
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(1),
  pricePerGram: z.coerce.number().positive(),
  weightGrams: z.coerce.number().positive(),
  stockGrams: z.coerce.number().min(0),
  origin: z.string().optional(),
  season: z.string().optional(),
  harvestDate: z.string().optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function SellEditPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const { data: sellerProfile } = useGetSellerProfile({
    query: { queryKey: getGetSellerProfileQueryKey() },
  });

  const updateProduct = useUpdateProduct();

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
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        category: product.category,
        pricePerGram: product.pricePerGram,
        weightGrams: product.weightGrams,
        stockGrams: product.stockGrams,
        origin: product.origin ?? "",
        season: product.season ?? "",
        harvestDate: product.harvestDate ?? "",
        imageUrl: product.imageUrl ?? "",
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable,
      });
    }
  }, [product, form]);

  const onSubmit = (values: FormValues) => {
    updateProduct.mutate(
      { id: productId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ sellerId: String(sellerProfile?.id ?? "") }) });
          toast({ title: "Listing updated!", description: "Your product has been updated" });
          setLocation("/sell");
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Edit Listing</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" className="mb-8 text-muted-foreground hover:text-primary -ml-2 gap-2">
          <Link href="/sell"><ArrowLeft className="w-4 h-4" /> Back to Seller Hub</Link>
        </Button>

        {isLoading ? (
          <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Listing Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-product-name" className="rounded-none" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category" className="rounded-none"><SelectValue /></SelectTrigger>
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
                    <FormControl><Input {...field} data-testid="input-origin" className="rounded-none" /></FormControl>
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

                <FormField control={form.control} name="stockGrams" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Available (g)</FormLabel>
                    <FormControl><Input {...field} data-testid="input-stock" type="number" step="1" className="rounded-none" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="textarea-description" className="rounded-none min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button data-testid="button-submit-product" type="submit" className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8" disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-none">
                  <Link href="/sell">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </PageLayout>
  );
}
