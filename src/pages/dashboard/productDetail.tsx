import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Product} from "../../commons/models";
import {productService} from "../../commons";
import {
    AppButton,
    AppContainer, AppImageSlider,
    AppQuantityControl,
    AppText,
    AppTitle
} from "../../commons/components";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import {addToCart} from "../../redux/slices/cartSlice";
import useSnackbarMethods from "../../hook/useSnackbarMethod";
import AppRating from "../../commons/components/ui-components/rating";
import ColorVariant from "./colorVariant";
import SizeVariant from "./sizeVariant";
import SetPageTitle from "../../hook/useSetPageTitle";

export default function ProductDetail() {
    SetPageTitle("Product Details");
    const {slug} = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();
    const {showSuccessSnackbar} = useSnackbarMethods();
    const cart = useSelector((state: RootState) => state.cart.item);
    const navigate = useNavigate();
    const handleAddToCart = (product: Product) => {
        const data = {product: product._id, quantity, variantType: product.variantType};
        if (cart) {
            setLoading('add');
            dispatch(addToCart({cartId: cart._id, item: data})).unwrap().then(_ => {
                setLoading('')
                showSuccessSnackbar({message: 'Item added successfully.'})
            }).catch(_ => setLoading(''));
        }

    };

    const handleBuyProduct = (product: Product) => {
        if (cart) {
            setLoading('buy')
            const data = {product: product._id, quantity, variantType: product.variantType};
            dispatch(addToCart({cartId: cart._id, item: data})).unwrap().then(_ => {
                setLoading('')
                navigate('/cart')
            }).catch(_ =>
                setLoading('')
            );
        }
    };

    useEffect(() => {
        if (slug) {
            productService.getProductDetails(slug).then((res) => {
                if (res) {
                    const product = new Product().mergeImages(res);
                    setProduct(product);
                }
            });
        }
    }, [slug]);

    return (
        <AppContainer>
            <div className='page-wrapper'>
                {product &&
                    <section className="flex flex-column gap-lg">
                        <div className="grid-row gap-md">
                            <div className="col-lg-4 col-md-5 col-sm-6">
                                <AppImageSlider images={product.images}/>
                            </div>
                            <div className="col-lg-8 col-md-7 col-sm-6">
                                <div className="flex flex-column gap-sm">
                                    <AppTitle as={'h5'}>{product.title}</AppTitle>
                                    <div className="flex gap-xs align-items-center">
                                        <AppTitle weight={'normal'} as={'h4'}
                                                  color={'danger'}>${product.price}</AppTitle>
                                        {product.price !== product.strikePrice && <div className="flex gap-2xs">
                                            <del className="body-lg text-muted">${product.strikePrice}</del>
                                            <AppText>-{product.offPercent}% Off</AppText></div>}
                                    </div>
                                    <div className="flex align-items-center gap-2xs">
                                        <AppRating value={product.ratings}/>
                                        <AppText color={'warning'}>{product.totalRatings} Ratings</AppText>
                                    </div>
                                    {product.variantType !== 'None' &&
                                        <div className="flex align-items-center gap-2xs">
                                            <AppText>{product.variantType}:</AppText>
                                            {product.variantType === 'Color' &&
                                                <ColorVariant variants={product.colorVariants}/>}
                                            {product.variantType === 'Size' &&
                                                <SizeVariant variants={product.sizeVariants}/>}
                                        </div>}
                                    <div className="flex align-items-center gap-2xs">
                                        <AppText>Brand:</AppText>
                                        <AppText>{product.brand.name}</AppText>
                                    </div>
                                    <div className="flex align-items-center gap-2xs">
                                        <AppText>Category:</AppText>
                                        <AppText>{product.category.title}</AppText>
                                    </div>
                                    <div className="flex align-items-center gap-2xs">
                                        <AppText>Qty:</AppText>
                                        <AppQuantityControl change={setQuantity}/>
                                    </div>
                                    <div className="flex gap-sm">
                                        <AppButton loading={loading==='add'} fullWidth label={'Add to Cart'}
                                                   variant='outline'
                                                   onClick={() => handleAddToCart(product)}/>
                                        <AppButton loading={loading==='buy'} fullWidth label={'Buy Now'}
                                                   onClick={() => handleBuyProduct(product)}></AppButton>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <section>
                            <AppTitle as={'h5'}>Details of {product.title}</AppTitle>
                            <div className='description'
                                 dangerouslySetInnerHTML={{__html: product.description}}></div>
                        </section>
                        <section>
                            <AppTitle as={'h5'}>How to use?</AppTitle>
                            <div className='description'
                                 dangerouslySetInnerHTML={{__html: product.howToUse}}></div>
                        </section>
                    </section>
                }
            </div>
        </AppContainer>
    )
}