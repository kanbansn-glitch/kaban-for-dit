<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InventoryDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $user = User::query()->updateOrCreate(
                ['id' => 1],
                [
                    'name' => 'Ouzac Retail',
                    'email' => 'ouzac.sn@gmail.com',
                    'password' => Hash::make('djafy-demo'),
                ]
            );

            if ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $categories = $this->seedCategories();
            $suppliers = $this->seedSuppliers($user->id);
            $stores = $this->seedStores($user->id);

            $products = $this->seedProducts($user->id, $categories, $suppliers, $stores);

            $this->seedPurchaseOrders($user->id, $products, $suppliers, $stores);
            $this->seedSales($user->id, $products, $stores);
        });
    }

    /**
     * @return array<string, Category>
     */
    protected function seedCategories(): array
    {
        $categories = [];

        $categoryData = [
            ['name' => 'Epicerie seche', 'description' => 'Riz, huiles, conserves et produits de base.'],
            ['name' => 'Boissons', 'description' => 'Jus, eau et sodas.'],
            ['name' => 'Produits laitiers', 'description' => 'Laits, yaourts et produits froids.'],
            ['name' => 'Fruits et legumes', 'description' => 'Fruits frais et legumes saisonniers.'],
            ['name' => 'Boulangerie et patisserie', 'description' => 'Pains, viennoiseries et douceurs.'],
            ['name' => 'Produits menagers', 'description' => 'Entretien de la maison et du linge.'],
            ['name' => 'Hygiene et beaute', 'description' => 'Soins du corps et produits d hygiene.'],
            ['name' => 'Surgeles', 'description' => 'Produits surgeles et pre-cuits.'],
            ['name' => 'Charcuterie', 'description' => 'Produits de charcuterie et degustation.'],
            ['name' => 'Snacking', 'description' => 'Snacks sales et sucreries.'],
        ];

        foreach ($categoryData as $data) {
            $category = Category::updateOrCreate(
                ['name' => $data['name']],
                ['description' => $data['description']]
            );

            $categories[$data['name']] = $category;
        }

        return $categories;
    }

    /**
     * @return array<string, Supplier>
     */
    protected function seedSuppliers(int $userId): array
    {
        $suppliers = [];

        $suppliersData = [
            [
                'name' => 'Terranga Distribution',
                'contact_number' => '221338000111',
                'email' => 'contact@terranga.sn',
                'address' => 'Zone industrielle Hann, Dakar',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Sen Agro Services',
                'contact_number' => '221338000235',
                'email' => 'ventes@senagro.sn',
                'address' => 'Route de Rufisque, Dakar',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Atlantic Boissons',
                'contact_number' => '221339990045',
                'email' => 'distribution@atlanticboissons.sn',
                'address' => 'Km 4 Boulevard du Centenaire, Dakar',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Laiterie du Sahel',
                'contact_number' => '221339880320',
                'email' => 'commandes@laiteriedusahel.sn',
                'address' => 'Parc industriel Sendou',
                'takes_back_returns' => false,
            ],
            [
                'name' => 'Maison du Menage',
                'contact_number' => '221338112233',
                'email' => 'service@maisondumenage.sn',
                'address' => 'Libertes 6, Dakar',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Azur Hygiene',
                'contact_number' => '221777654321',
                'email' => 'support@azurhygiene.sn',
                'address' => 'Sacre Coeur 3, Dakar',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Boulangerie Royale',
                'contact_number' => '221338740020',
                'email' => 'royale@boulangeriesn.sn',
                'address' => 'Rue Carnot, Dakar Plateau',
                'takes_back_returns' => false,
            ],
            [
                'name' => 'Soleil Vert Maraichers',
                'contact_number' => '221778880012',
                'email' => 'production@soleilvert.sn',
                'address' => 'Niayes, Region de Dakar',
                'takes_back_returns' => false,
            ],
            [
                'name' => 'Nordic Surgeles',
                'contact_number' => '221338420089',
                'email' => 'logistique@nordicsn.sn',
                'address' => 'Port autonome de Dakar, Entrepot 12',
                'takes_back_returns' => true,
            ],
            [
                'name' => 'Delices Gourmands',
                'contact_number' => '221339870145',
                'email' => 'contact@delicesgourmands.sn',
                'address' => 'Amitie 3, Dakar',
                'takes_back_returns' => false,
            ],
        ];

        foreach ($suppliersData as $data) {
            $supplier = Supplier::updateOrCreate(
                [
                    'user_id' => $userId,
                    'name' => $data['name'],
                ],
                [
                    'contact_number' => $data['contact_number'],
                    'email' => $data['email'],
                    'address' => $data['address'],
                    'takes_back_returns' => $data['takes_back_returns'],
                ]
            );

            $suppliers[$data['name']] = $supplier;
        }

        return $suppliers;
    }

    /**
     * @return array<string, Store>
     */
    protected function seedStores(int $userId): array
    {
        $stores = [];

        $storesData = [
            [
                'name' => 'Depot Principal',
                'branch_name' => 'Dakar Plateau',
                'address_line' => 'Avenue Lamine Gueye',
                'city' => 'Dakar',
                'postal_code' => 'BP 12345',
                'phone' => '221338000001',
            ],
            [
                'name' => 'Boutique Medina',
                'branch_name' => 'Medina',
                'address_line' => 'Rue 31 x Blaise Diagne',
                'city' => 'Dakar',
                'postal_code' => 'BP 21300',
                'phone' => '221338000245',
            ],
            [
                'name' => 'Boutique Almadies',
                'branch_name' => 'Almadies',
                'address_line' => 'Route des Almadies',
                'city' => 'Dakar',
                'postal_code' => 'BP 10028',
                'phone' => '221778000456',
            ],
        ];

        foreach ($storesData as $data) {
            $store = Store::updateOrCreate(
                [
                    'user_id' => $userId,
                    'name' => $data['name'],
                    'branch_name' => $data['branch_name'],
                ],
                [
                    'address_line' => $data['address_line'],
                    'city' => $data['city'],
                    'postal_code' => $data['postal_code'],
                    'phone' => $data['phone'],
                ]
            );

            $key = $data['name'] . '|' . $data['branch_name'];
            $stores[$key] = $store;
        }

        return $stores;
    }

    /**
     * @param  array<string, Category>  $categories
     * @param  array<string, Supplier>  $suppliers
     * @param  array<string, Store>  $stores
     * @return array<string, Product>
     */
    protected function seedProducts(int $userId, array $categories, array $suppliers, array $stores): array
    {
        $products = [];

        $productsData = [
            [
                'code' => 'ALM-0001',
                'name' => 'Riz parfume 25 kg',
                'category' => 'Epicerie seche',
                'supplier' => 'Terranga Distribution',
                'buying_price' => 13500,
                'selling_price' => 16500,
                'threshold' => 20,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 28, 'threshold' => 12],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 10, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 8, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'ALM-0002',
                'name' => "Huile d'arachide 5L",
                'category' => 'Epicerie seche',
                'supplier' => 'Terranga Distribution',
                'buying_price' => 8500,
                'selling_price' => 10500,
                'threshold' => 18,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 20, 'threshold' => 10],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'ALM-0003',
                'name' => 'Sucre en poudre 50 kg',
                'category' => 'Epicerie seche',
                'supplier' => 'Terranga Distribution',
                'buying_price' => 28000,
                'selling_price' => 32000,
                'threshold' => 16,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 15, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 8, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 5, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'ALM-0004',
                'name' => 'Miel de casamance 1 kg',
                'category' => 'Epicerie seche',
                'supplier' => 'Sen Agro Services',
                'buying_price' => 5200,
                'selling_price' => 7200,
                'threshold' => 14,
                'expiry_date' => '2025-11-30',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 9, 'threshold' => 5],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 6, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 4, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'DRK-0001',
                'name' => 'Jus de bissap 1L',
                'category' => 'Boissons',
                'supplier' => 'Atlantic Boissons',
                'buying_price' => 600,
                'selling_price' => 900,
                'threshold' => 18,
                'expiry_date' => '2025-08-20',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 22, 'threshold' => 10],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 14, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 10, 'threshold' => 5],
                ],
            ],
            [
                'code' => 'DRK-0002',
                'name' => 'Eau minerale 1.5L pack',
                'category' => 'Boissons',
                'supplier' => 'Atlantic Boissons',
                'buying_price' => 1800,
                'selling_price' => 2200,
                'threshold' => 25,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 35, 'threshold' => 15],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 20, 'threshold' => 8],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 18, 'threshold' => 6],
                ],
            ],
            [
                'code' => 'DRK-0003',
                'name' => 'Soda gingembre 33cl',
                'category' => 'Boissons',
                'supplier' => 'Atlantic Boissons',
                'buying_price' => 350,
                'selling_price' => 600,
                'threshold' => 20,
                'expiry_date' => '2025-09-10',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 26, 'threshold' => 12],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 15, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 12, 'threshold' => 5],
                ],
            ],
            [
                'code' => 'DAI-0001',
                'name' => 'Yaourt nature 125g',
                'category' => 'Produits laitiers',
                'supplier' => 'Laiterie du Sahel',
                'buying_price' => 220,
                'selling_price' => 500,
                'threshold' => 15,
                'expiry_date' => '2025-04-10',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 18, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 8, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'DAI-0002',
                'name' => 'Lait pasteurise 1L',
                'category' => 'Produits laitiers',
                'supplier' => 'Laiterie du Sahel',
                'buying_price' => 550,
                'selling_price' => 800,
                'threshold' => 20,
                'expiry_date' => '2025-03-05',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 24, 'threshold' => 10],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 16, 'threshold' => 7],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 12, 'threshold' => 5],
                ],
            ],
            [
                'code' => 'DAI-0003',
                'name' => 'Beurre doux 200g',
                'category' => 'Produits laitiers',
                'supplier' => 'Laiterie du Sahel',
                'buying_price' => 900,
                'selling_price' => 1200,
                'threshold' => 10,
                'expiry_date' => '2025-08-15',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 12, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 8, 'threshold' => 3],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 2],
                ],
            ],
            [
                'code' => 'FRU-0001',
                'name' => 'Mangue kent caisse',
                'category' => 'Fruits et legumes',
                'supplier' => 'Soleil Vert Maraichers',
                'buying_price' => 13000,
                'selling_price' => 17000,
                'threshold' => 18,
                'expiry_date' => '2025-02-20',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 18, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 9, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'FRU-0002',
                'name' => 'Tomate ronde 5 kg',
                'category' => 'Fruits et legumes',
                'supplier' => 'Soleil Vert Maraichers',
                'buying_price' => 6000,
                'selling_price' => 9000,
                'threshold' => 15,
                'expiry_date' => '2025-02-05',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 14, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 10, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'FRU-0003',
                'name' => 'Pomme de terre 25 kg',
                'category' => 'Fruits et legumes',
                'supplier' => 'Sen Agro Services',
                'buying_price' => 11000,
                'selling_price' => 14000,
                'threshold' => 15,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 20, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 10, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'FRU-0004',
                'name' => 'Banane plantain caisse',
                'category' => 'Fruits et legumes',
                'supplier' => 'Sen Agro Services',
                'buying_price' => 15000,
                'selling_price' => 19000,
                'threshold' => 8,
                'expiry_date' => '2025-02-12',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 0, 'threshold' => 5],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 0, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'BAK-0001',
                'name' => 'Baguette tradition',
                'category' => 'Boulangerie et patisserie',
                'supplier' => 'Boulangerie Royale',
                'buying_price' => 150,
                'selling_price' => 400,
                'threshold' => 100,
                'expiry_date' => '2025-01-30',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 120, 'threshold' => 60],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 80, 'threshold' => 40],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 60, 'threshold' => 30],
                ],
            ],
            [
                'code' => 'BAK-0002',
                'name' => 'Croissant beurre',
                'category' => 'Boulangerie et patisserie',
                'supplier' => 'Boulangerie Royale',
                'buying_price' => 220,
                'selling_price' => 500,
                'threshold' => 80,
                'expiry_date' => '2025-01-30',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 90, 'threshold' => 40],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 70, 'threshold' => 30],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 50, 'threshold' => 20],
                ],
            ],
            [
                'code' => 'BAK-0003',
                'name' => 'Gateau chocolat 600g',
                'category' => 'Boulangerie et patisserie',
                'supplier' => 'Boulangerie Royale',
                'buying_price' => 5000,
                'selling_price' => 7800,
                'threshold' => 12,
                'expiry_date' => '2025-02-28',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 12, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 8, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'HOM-0001',
                'name' => 'Lessive poudre 5 kg',
                'category' => 'Produits menagers',
                'supplier' => 'Maison du Menage',
                'buying_price' => 6500,
                'selling_price' => 8800,
                'threshold' => 18,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 18, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 10, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'HOM-0002',
                'name' => 'Liquide vaisselle 1L',
                'category' => 'Produits menagers',
                'supplier' => 'Maison du Menage',
                'buying_price' => 800,
                'selling_price' => 1300,
                'threshold' => 18,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 22, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 14, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 10, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'HOM-0003',
                'name' => 'Essuie tout paquet 6',
                'category' => 'Produits menagers',
                'supplier' => 'Maison du Menage',
                'buying_price' => 2500,
                'selling_price' => 3600,
                'threshold' => 16,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 16, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 9, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'HOM-0004',
                'name' => 'Desinfectant surfaces 5L',
                'category' => 'Produits menagers',
                'supplier' => 'Maison du Menage',
                'buying_price' => 4200,
                'selling_price' => 6900,
                'threshold' => 12,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 5, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 3, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'HYG-0001',
                'name' => 'Gel hydroalcoolique 500ml',
                'category' => 'Hygiene et beaute',
                'supplier' => 'Azur Hygiene',
                'buying_price' => 1100,
                'selling_price' => 1800,
                'threshold' => 12,
                'expiry_date' => '2025-10-01',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 15, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 10, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 8, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'HYG-0002',
                'name' => 'Savon antiseptique',
                'category' => 'Hygiene et beaute',
                'supplier' => 'Azur Hygiene',
                'buying_price' => 700,
                'selling_price' => 1200,
                'threshold' => 18,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 24, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 18, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 14, 'threshold' => 5],
                ],
            ],
            [
                'code' => 'HYG-0003',
                'name' => 'Creme hydratante 200ml',
                'category' => 'Hygiene et beaute',
                'supplier' => 'Azur Hygiene',
                'buying_price' => 2500,
                'selling_price' => 4200,
                'threshold' => 10,
                'expiry_date' => '2025-12-01',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 10, 'threshold' => 4],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 6, 'threshold' => 3],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 4, 'threshold' => 2],
                ],
            ],
            [
                'code' => 'FRO-0001',
                'name' => 'Filet de poisson congele 1 kg',
                'category' => 'Surgeles',
                'supplier' => 'Nordic Surgeles',
                'buying_price' => 3200,
                'selling_price' => 5500,
                'threshold' => 15,
                'expiry_date' => '2025-09-30',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 18, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 8, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'FRO-0002',
                'name' => 'Poulet braise pre-cuit',
                'category' => 'Surgeles',
                'supplier' => 'Nordic Surgeles',
                'buying_price' => 2800,
                'selling_price' => 5200,
                'threshold' => 12,
                'expiry_date' => '2025-07-20',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 14, 'threshold' => 5],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 10, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 6, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'CHR-0001',
                'name' => 'Jambon de dinde 1 kg',
                'category' => 'Charcuterie',
                'supplier' => 'Delices Gourmands',
                'buying_price' => 4800,
                'selling_price' => 7600,
                'threshold' => 10,
                'expiry_date' => '2025-06-15',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 10, 'threshold' => 4],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 6, 'threshold' => 3],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 4, 'threshold' => 2],
                ],
            ],
            [
                'code' => 'CHR-0002',
                'name' => 'Saucisse de poulet 500g',
                'category' => 'Charcuterie',
                'supplier' => 'Delices Gourmands',
                'buying_price' => 3500,
                'selling_price' => 6000,
                'threshold' => 12,
                'expiry_date' => '2025-05-10',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 16, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 8, 'threshold' => 3],
                ],
            ],
            [
                'code' => 'SNK-0001',
                'name' => 'Chips patate douce 150g',
                'category' => 'Snacking',
                'supplier' => 'Delices Gourmands',
                'buying_price' => 900,
                'selling_price' => 1500,
                'threshold' => 15,
                'expiry_date' => '2025-11-05',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 18, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 14, 'threshold' => 5],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 12, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'SNK-0002',
                'name' => 'Arachides grillees 200g',
                'category' => 'Snacking',
                'supplier' => 'Delices Gourmands',
                'buying_price' => 700,
                'selling_price' => 1200,
                'threshold' => 18,
                'expiry_date' => null,
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 20, 'threshold' => 8],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 16, 'threshold' => 6],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 12, 'threshold' => 4],
                ],
            ],
            [
                'code' => 'SNK-0003',
                'name' => 'Biscuits beurre 300g',
                'category' => 'Snacking',
                'supplier' => 'Delices Gourmands',
                'buying_price' => 800,
                'selling_price' => 1400,
                'threshold' => 12,
                'expiry_date' => '2025-12-20',
                'store_stock' => [
                    ['store' => 'Depot Principal|Dakar Plateau', 'quantity' => 16, 'threshold' => 6],
                    ['store' => 'Boutique Medina|Medina', 'quantity' => 12, 'threshold' => 4],
                    ['store' => 'Boutique Almadies|Almadies', 'quantity' => 10, 'threshold' => 3],
                ],
            ],
        ];

        foreach ($productsData as $data) {
            if (! isset($categories[$data['category']])) {
                continue;
            }

            $supplier = null;
            if (! empty($data['supplier']) && isset($suppliers[$data['supplier']])) {
                $supplier = $suppliers[$data['supplier']];
            }

            $storeStock = $data['store_stock'] ?? [];

            $totalQuantity = array_sum(array_map(
                static fn ($stock) => (int) ($stock['quantity'] ?? 0),
                $storeStock
            ));

            $status = $this->determineStatus($totalQuantity, (int) $data['threshold']);

            $product = Product::updateOrCreate(
                [
                    'user_id' => $userId,
                    'product_code' => $data['code'],
                ],
                [
                    'name' => $data['name'],
                    'category_id' => $categories[$data['category']]->id,
                    'supplier_id' => $supplier?->id,
                    'buying_price' => $data['buying_price'],
                    'selling_price' => $data['selling_price'],
                    'quantity' => $totalQuantity,
                    'threshold' => $data['threshold'],
                    'expiry_date' => $data['expiry_date'] ? Carbon::parse($data['expiry_date']) : null,
                    'status' => $status,
                ]
            );

            $syncStores = [];

            foreach ($storeStock as $stock) {
                $storeKey = $stock['store'];

                if (! isset($stores[$storeKey])) {
                    continue;
                }

                $syncStores[$stores[$storeKey]->id] = [
                    'quantity' => (int) ($stock['quantity'] ?? 0),
                    'threshold' => (int) ($stock['threshold'] ?? $data['threshold']),
                ];
            }

            $product->stores()->sync($syncStores);

            $products[$data['code']] = $product;
        }

        return $products;
    }

    /**
     * @param  array<string, Product>  $products
     * @param  array<string, Supplier>  $suppliers
     * @param  array<string, Store>  $stores
     */
    protected function seedPurchaseOrders(int $userId, array $products, array $suppliers, array $stores): void
    {
        $ordersData = [
            [
                'order_number' => 'PO-000201',
                'product_code' => 'ALM-0001',
                'supplier' => 'Terranga Distribution',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 80,
                'unit' => 'sacs',
                'order_date' => '2025-01-12',
                'expected_date' => '2025-01-19',
                'status' => 'Delivered',
                'notify_on_delivery' => true,
                'delivered_at' => '2025-01-19 09:30:00',
                'notes' => 'Livraison de lancement pour la campagne de fevrier.',
            ],
            [
                'order_number' => 'PO-000202',
                'product_code' => 'ALM-0002',
                'supplier' => 'Terranga Distribution',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 60,
                'unit' => 'bidons',
                'order_date' => '2025-01-14',
                'expected_date' => '2025-01-21',
                'status' => 'Delivered',
                'notify_on_delivery' => false,
                'delivered_at' => '2025-01-21 11:45:00',
                'notes' => 'Controle qualite effectue a la reception.',
            ],
            [
                'order_number' => 'PO-000203',
                'product_code' => 'DRK-0001',
                'supplier' => 'Atlantic Boissons',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 120,
                'unit' => 'bouteilles',
                'order_date' => '2025-01-16',
                'expected_date' => '2025-01-18',
                'status' => 'Delivered',
                'notify_on_delivery' => true,
                'delivered_at' => '2025-01-18 08:15:00',
                'notes' => 'Livraison matinale pour reapprovisionnement weekend.',
            ],
            [
                'order_number' => 'PO-000204',
                'product_code' => 'DRK-0002',
                'supplier' => 'Atlantic Boissons',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 150,
                'unit' => 'packs',
                'order_date' => '2025-01-18',
                'expected_date' => '2025-01-25',
                'status' => 'Out for delivery',
                'notify_on_delivery' => true,
                'notes' => 'Livraison en cours par camion frigorifique.',
            ],
            [
                'order_number' => 'PO-000205',
                'product_code' => 'DAI-0001',
                'supplier' => 'Laiterie du Sahel',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 90,
                'unit' => 'lots',
                'order_date' => '2025-01-20',
                'expected_date' => '2025-01-22',
                'status' => 'Delivered',
                'notify_on_delivery' => false,
                'delivered_at' => '2025-01-22 07:50:00',
                'notes' => 'Respecter la chaine du froid a la mise en rayon.',
            ],
            [
                'order_number' => 'PO-000206',
                'product_code' => 'FRU-0001',
                'supplier' => 'Soleil Vert Maraichers',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 45,
                'unit' => 'caisses',
                'order_date' => '2025-01-22',
                'expected_date' => '2025-01-23',
                'status' => 'Delivered',
                'notify_on_delivery' => false,
                'delivered_at' => '2025-01-23 05:40:00',
                'notes' => 'Reception avant ouverture du magasin.',
            ],
            [
                'order_number' => 'PO-000207',
                'product_code' => 'BAK-0001',
                'supplier' => 'Boulangerie Royale',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 300,
                'unit' => 'pieces',
                'order_date' => '2025-01-23',
                'expected_date' => '2025-01-24',
                'status' => 'Confirmed',
                'notify_on_delivery' => true,
                'notes' => 'Production speciale pour l evenement client.',
            ],
            [
                'order_number' => 'PO-000208',
                'product_code' => 'HOM-0001',
                'supplier' => 'Maison du Menage',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 90,
                'unit' => 'sachets',
                'order_date' => '2025-01-24',
                'expected_date' => '2025-01-29',
                'status' => 'Delivered',
                'notify_on_delivery' => false,
                'delivered_at' => '2025-01-29 14:05:00',
                'notes' => 'Verifier les codes lots pour la promo fevrier.',
            ],
            [
                'order_number' => 'PO-000209',
                'product_code' => 'HOM-0004',
                'supplier' => 'Maison du Menage',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 40,
                'unit' => 'bidons',
                'order_date' => '2025-01-25',
                'expected_date' => '2025-02-02',
                'status' => 'Delayed',
                'notify_on_delivery' => true,
                'notes' => 'Fournisseur en rupture partielle, relance prevue.',
            ],
            [
                'order_number' => 'PO-000210',
                'product_code' => 'FRO-0001',
                'supplier' => 'Nordic Surgeles',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 70,
                'unit' => 'colis',
                'order_date' => '2025-01-26',
                'expected_date' => '2025-01-30',
                'status' => 'Delivered',
                'notify_on_delivery' => true,
                'delivered_at' => '2025-01-30 10:20:00',
                'notes' => 'Stock surgele a verifier avant rangement.',
            ],
            [
                'order_number' => 'PO-000211',
                'product_code' => 'CHR-0001',
                'supplier' => 'Delices Gourmands',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 50,
                'unit' => 'pieces',
                'order_date' => '2025-01-27',
                'expected_date' => '2025-01-28',
                'status' => 'Delivered',
                'notify_on_delivery' => false,
                'delivered_at' => '2025-01-28 12:25:00',
                'notes' => 'Produit premium pour clientele expat.',
            ],
            [
                'order_number' => 'PO-000212',
                'product_code' => 'SNK-0002',
                'supplier' => 'Delices Gourmands',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 120,
                'unit' => 'sachets',
                'order_date' => '2025-01-28',
                'expected_date' => '2025-02-01',
                'status' => 'Confirmed',
                'notify_on_delivery' => false,
                'notes' => 'Planifier la mise en avant sur les points de vente.',
            ],
        ];

        foreach ($ordersData as $data) {
            if (! isset($products[$data['product_code']], $suppliers[$data['supplier']])) {
                continue;
            }

            $product = $products[$data['product_code']];
            $supplier = $suppliers[$data['supplier']];

            $storeId = null;
            if (! empty($data['store']) && isset($stores[$data['store']])) {
                $storeId = $stores[$data['store']]->id;
            }

            $status = $data['status'] ?? 'Confirmed';
            $deliveredAt = null;

            if ($status === 'Delivered') {
                if (! empty($data['delivered_at'])) {
                    $deliveredAt = Carbon::parse($data['delivered_at']);
                } elseif (! empty($data['expected_date'])) {
                    $deliveredAt = Carbon::parse($data['expected_date'] . ' 09:00:00');
                } else {
                    $deliveredAt = Carbon::parse($data['order_date'] . ' 09:00:00');
                }
            }

            PurchaseOrder::updateOrCreate(
                [
                    'user_id' => $userId,
                    'order_number' => $data['order_number'],
                ],
                [
                    'product_id' => $product->id,
                    'supplier_id' => $supplier->id,
                    'store_id' => $storeId,
                    'quantity' => $data['quantity'],
                    'unit' => $data['unit'] ?? null,
                    'order_value' => (float) $product->buying_price * (int) $data['quantity'],
                    'order_date' => Carbon::parse($data['order_date'])->toDateString(),
                    'expected_date' => ! empty($data['expected_date'])
                        ? Carbon::parse($data['expected_date'])->toDateString()
                        : null,
                    'status' => $status,
                    'notify_on_delivery' => (bool) ($data['notify_on_delivery'] ?? false),
                    'delivered_at' => $deliveredAt,
                    'notes' => $data['notes'] ?? null,
                ]
            );
        }
    }

    /**
     * @param  array<string, Product>  $products
     * @param  array<string, Store>  $stores
     */
    protected function seedSales(int $userId, array $products, array $stores): void
    {
        $salesData = [
            [
                'product_code' => 'ALM-0001',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 5,
                'sale_date' => '2025-02-05',
                'selling_price' => 16800,
            ],
            [
                'product_code' => 'ALM-0001',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 4,
                'sale_date' => '2025-02-06',
                'selling_price' => 16900,
            ],
            [
                'product_code' => 'ALM-0002',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 6,
                'sale_date' => '2025-02-08',
                'selling_price' => 10900,
            ],
            [
                'product_code' => 'DRK-0001',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 12,
                'sale_date' => '2025-02-04',
                'selling_price' => 950,
            ],
            [
                'product_code' => 'DRK-0002',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 15,
                'sale_date' => '2025-02-03',
                'selling_price' => 2300,
            ],
            [
                'product_code' => 'DAI-0002',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 10,
                'sale_date' => '2025-02-07',
                'selling_price' => 1150,
            ],
            [
                'product_code' => 'FRU-0001',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 8,
                'sale_date' => '2025-02-09',
                'selling_price' => 21000,
            ],
            [
                'product_code' => 'FRU-0002',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 6,
                'sale_date' => '2025-02-05',
                'selling_price' => 8800,
            ],
            [
                'product_code' => 'BAK-0001',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 60,
                'sale_date' => '2025-02-05',
                'selling_price' => 380,
            ],
            [
                'product_code' => 'BAK-0002',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 40,
                'sale_date' => '2025-02-05',
                'selling_price' => 480,
            ],
            [
                'product_code' => 'HOM-0001',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 8,
                'sale_date' => '2025-02-02',
                'selling_price' => 8200,
            ],
            [
                'product_code' => 'HYG-0001',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 7,
                'sale_date' => '2025-02-01',
                'selling_price' => 1750,
            ],
            [
                'product_code' => 'FRO-0001',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 6,
                'sale_date' => '2025-02-06',
                'selling_price' => 5400,
            ],
            [
                'product_code' => 'CHR-0002',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 9,
                'sale_date' => '2025-02-07',
                'selling_price' => 2900,
            ],
            [
                'product_code' => 'SNK-0002',
                'store' => 'Depot Principal|Dakar Plateau',
                'quantity' => 12,
                'sale_date' => '2025-02-03',
                'selling_price' => 1500,
            ],
            [
                'product_code' => 'HOM-0004',
                'store' => 'Boutique Medina|Medina',
                'quantity' => 4,
                'sale_date' => '2025-02-04',
                'selling_price' => 7100,
            ],
            [
                'product_code' => 'SNK-0001',
                'store' => 'Boutique Almadies|Almadies',
                'quantity' => 9,
                'sale_date' => '2025-02-06',
                'selling_price' => 1500,
            ],
        ];

        foreach ($salesData as $data) {
            if (! isset($products[$data['product_code']])) {
                continue;
            }

            $product = $products[$data['product_code']];

            $storeId = null;
            if (! empty($data['store']) && isset($stores[$data['store']])) {
                $storeId = $stores[$data['store']]->id;
            }

            Sale::updateOrCreate(
                [
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'store_id' => $storeId,
                    'sale_date' => Carbon::parse($data['sale_date'])->toDateString(),
                    'quantity' => $data['quantity'],
                ],
                [
                    'selling_price' => $data['selling_price'] ?? $product->selling_price,
                    'buying_price' => $data['buying_price'] ?? $product->buying_price,
                ]
            );
        }
    }

    protected function determineStatus(int $quantity, int $threshold): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        }

        if ($quantity <= $threshold) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
