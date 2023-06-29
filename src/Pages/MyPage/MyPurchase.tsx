import React, { useEffect, useState } from 'react';
import { Button, Space, Spin, Pagination, Modal, Checkbox } from 'antd';
import { useCookies } from 'react-cookie';
import VoucherModal from 'Components/Contents/VoucherModal';
import {
  authResponseData,
  allBuyProductApi,
  oneBuyProductApi,
  cancelProductApi,
  OneTransactionDetail,
  MyPurchases,
  CancelRequestBody,
} from '../../api';

const MyPurchase: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [completedPurchases, setCompletedPurchases] = useState<MyPurchases>([]);
  const [cancelledPurchases, setCancelledPurchases] = useState<MyPurchases>([]);
  const [ongoingPurchases, setOngoingPurchases] = useState<MyPurchases>([]);
  const [purchaseDetail, setPurchaseDetail] = useState<OneTransactionDetail>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [voucherModalDetailId, setVoucherModalDetailId] = useState<string>('');
  const [voucherModalTitle, setVoucherModalTitle] = useState<string>('');
  const [voucherModalDes, setVoucherModalDes] = useState<string>('');
  const [voucherModalImg, setVoucherModalImg] = useState<
    string | null | undefined
  >('');
  const [voucherModalSt, setVoucherModalSt] = useState<string | undefined>();
  const [voucherModalEn, setVoucherModalEn] = useState<string | undefined>();
  const [cancelConfirm, setCancelConfirm] = useState<boolean>(false);
  const [ongoinCurrentPage, setOngoinCurrentPage] = useState<number>(1);
  const [cancelledCurrentPage, setCancelledCurrentPage] = useState<number>(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState<number>(1);

  const [isOpenVoucher, setIsOpenVoucher] = useState<boolean>(false);
  const [cookies] = useCookies(['accessToken']);
  const accessToken: authResponseData = cookies.accessToken;

  const pageSize = 3; // 페이지네이션 1페이지당 출력되는 예약 건수

  // '현재예약현황', '취소된예약', '지난예약'별
  // startIndex/endIndex
  const ongoingStartIndex = (ongoinCurrentPage - 1) * pageSize;
  const cancelledStartIndex = (cancelledCurrentPage - 1) * pageSize;
  const completedStartIndex = (completedCurrentPage - 1) * pageSize;

  const ongoingEndIndex = ongoingStartIndex + pageSize;
  const cancelledEndIndex = cancelledStartIndex + pageSize;
  const completedEndIndex = completedStartIndex + pageSize;

  // PaginationDisplay
  const displayOngoingPurchases = ongoingPurchases.slice(
    ongoingStartIndex,
    ongoingEndIndex
  );
  const displayCancelledPurchases = cancelledPurchases.slice(
    cancelledStartIndex,
    cancelledEndIndex
  );
  const displayCompletedPurchases = completedPurchases.slice(
    completedStartIndex,
    completedEndIndex
  );

  useEffect(() => {
    getMyPurchases(accessToken);
  }, []);

  const getMyPurchases = async (accessToken: authResponseData) => {
    if (!loading) {
      return;
    }
    try {
      setLoading(false);
      const res = await allBuyProductApi(accessToken);
      // setLoading(false);
      setCompletedPurchases(
        res.filter(
          (purchase) => !purchase.isCanceled && purchase.reservation?.isExpired
        )
      );
      setCancelledPurchases(res.filter((purchase) => purchase.isCanceled));
      setOngoingPurchases(
        res.filter(
          (purchase) =>
            !purchase.done &&
            !purchase.isCanceled &&
            !purchase.reservation?.isExpired
        )
      );
    } catch (e) {
      console.log(e);
    }
  };

  const getPurchaseDetail = async (detailId: string) => {
    const body = {
      detailId: detailId,
    };
    const res = await oneBuyProductApi(accessToken, body);
    setPurchaseDetail(res);
  };

  const showCancelModal = async (product: any) => {
    await getPurchaseDetail(product.detailId);
    setIsModalVisible(true);
  };
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setCancelConfirm(false);
  };
  const cancelProduct = async (detailId: string) => {
    const body: CancelRequestBody = {
      detailId: detailId,
    };
    await cancelProductApi(accessToken, body);
    setIsModalVisible(false);
    getMyPurchases(accessToken);
  };

  const ongoingPageChangeHandler = (page: number) => {
    setOngoinCurrentPage(page);
  };
  const cancelledPageChangeHandler = (page: number) => {
    setCancelledCurrentPage(page);
  };
  const completedPageChangeHandler = (page: number) => {
    setCompletedCurrentPage(page);
  };

  const openVoucherModal = (
    detailId: string,
    title: string,
    description: string,
    img: string | null | undefined,
    start: string | undefined,
    end: string | undefined
  ) => {
    setVoucherModalDetailId(detailId);
    setVoucherModalTitle(title);
    setVoucherModalDes(description);
    setVoucherModalImg(img);
    setVoucherModalSt(start);
    setVoucherModalEn(end);
    setIsOpenVoucher(true);
  };
  const closeVoucherModal = () => {
    setIsOpenVoucher(false);
  };

  return (
    <div>
      <div>
        {loading ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Spin tip="loading..." size="large"></Spin>
          </Space>
        ) : (
          <>
            <div style={{ border: '1px solid black' }}>
              <h1>현재 예약 현황</h1>
              {ongoingPurchases.length === 0 ? (
                <h2 style={{ display: 'flex', justifyContent: 'center' }}>
                  결과없음
                </h2>
              ) : (
                displayOngoingPurchases.map((product, index) => (
                  <>
                    <div key={index}>
                      <h2>{product.product.title}</h2>
                      <Button
                        onClick={() =>
                          openVoucherModal(
                            product.detailId,
                            product.product.title,
                            product.product.description,
                            product.product.thumbnail,
                            product.reservation?.start,
                            product.reservation?.end
                          )
                        }
                      >
                        예약 확인증
                      </Button>

                      <div style={{ display: 'flex', height: '40px' }}>
                        <div
                          style={{ width: '40%', border: '1px solid black' }}
                        >
                          서울 강남구
                        </div>
                        <div
                          style={{
                            width: '60%',
                            border: '1px solid black',
                          }}
                        >
                          <span>
                            {product.reservation?.start.split('T')[0]} /{' '}
                            {
                              product.reservation?.start
                                .split('T')[1]
                                .split(':')[0]
                            }
                            시 ~{' '}
                            {
                              product.reservation?.end
                                .split('T')[1]
                                .split(':')[0]
                            }
                            시
                          </span>
                        </div>
                      </div>
                      <Button block onClick={() => showCancelModal(product)}>
                        예약 취소
                      </Button>
                      <Modal
                        title="예약 취소하기"
                        open={isModalVisible}
                        centered
                        onCancel={handleCancelModal}
                        footer={[
                          <Button
                            key="submit"
                            type="primary"
                            onClick={() => cancelProduct(product.detailId)}
                            disabled={cancelConfirm ? false : true}
                          >
                            예약 취소하기
                          </Button>,
                        ]}
                      >
                        <h4>{purchaseDetail?.product.title}</h4>
                        <div style={{ display: 'flex', height: '40px' }}>
                          <div
                            style={{ width: '40%', border: '1px solid black' }}
                          >
                            서울 강남구
                          </div>
                          <div
                            style={{
                              width: '60%',
                              border: '1px solid black',
                            }}
                          >
                            <span>
                              {purchaseDetail?.reservation?.start.split('T')[0]}{' '}
                              /{' '}
                              {
                                purchaseDetail?.reservation?.start
                                  .split('T')[1]
                                  .split(':')[0]
                              }
                              시 ~{' '}
                              {
                                purchaseDetail?.reservation?.end
                                  .split('T')[1]
                                  .split(':')[0]
                              }
                              시
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            border: '1px solid black',
                            margin: '10px 0',
                          }}
                        >
                          [취소약관]
                          <div>
                            <p>
                              취소 요청은 상호 합의에 따라 처리될 수 있습니다.
                            </p>
                            <p>
                              거래 취소 시, 환불 여부와 환불 규정은 개별 거래에
                              따라 달라질 수 있습니다.
                            </p>
                            <p>
                              상대방의 부적절한 행동, 불이익 등이 취소 사유로
                              인정될 경우, 환불 및 기타 조치에 대한 결정은
                              합리적인 판단에 따라 이루어질 수 있습니다.
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          취소 약관에 동의합니다
                          <Checkbox
                            checked={cancelConfirm}
                            onChange={() => setCancelConfirm(!cancelConfirm)}
                          ></Checkbox>
                        </div>
                      </Modal>
                    </div>
                    <VoucherModal
                      open={isOpenVoucher}
                      onCancel={closeVoucherModal}
                      detailId={voucherModalDetailId}
                      title={voucherModalTitle}
                      description={voucherModalDes}
                      img={voucherModalImg}
                      start={voucherModalSt}
                      end={voucherModalEn}
                    />
                  </>
                ))
              )}
              <Pagination
                style={{ display: 'flex', justifyContent: 'center' }}
                current={ongoinCurrentPage}
                pageSize={pageSize}
                total={ongoingPurchases.length}
                onChange={ongoingPageChangeHandler}
              />
            </div>
            <div style={{ border: '1px solid black' }}>
              <h1>취소된 예약</h1>
              {cancelledPurchases.length === 0 ? (
                <h2 style={{ display: 'flex', justifyContent: 'center' }}>
                  결과없음
                </h2>
              ) : (
                displayCancelledPurchases.map((product, index) => (
                  <div style={{ border: '1px solid black' }} key={index}>
                    <h2>{product.product.title}</h2>
                    <Button
                      onClick={() =>
                        openVoucherModal(
                          product.detailId,
                          product.product.title,
                          product.product.description,
                          product.product.thumbnail,
                          product.reservation?.start,
                          product.reservation?.end
                        )
                      }
                    >
                      예약 확인증
                    </Button>
                    <div style={{ display: 'flex', height: '40px' }}>
                      <div style={{ width: '40%', border: '1px solid black' }}>
                        서울 강남구
                      </div>
                      <div
                        style={{
                          width: '60%',
                          border: '1px solid black',
                        }}
                      >
                        <span>
                          {product.reservation?.start.split('T')[0]} /{' '}
                          {
                            product.reservation?.start
                              .split('T')[1]
                              .split(':')[0]
                          }
                          시 ~{' '}
                          {product.reservation?.end.split('T')[1].split(':')[0]}
                          시
                        </span>
                      </div>
                    </div>
                    <VoucherModal
                      open={isOpenVoucher}
                      onCancel={closeVoucherModal}
                      detailId={voucherModalDetailId}
                      title={voucherModalTitle}
                      description={voucherModalDes}
                      img={voucherModalImg}
                      start={voucherModalSt}
                      end={voucherModalEn}
                    />
                  </div>
                ))
              )}
              <Pagination
                style={{ display: 'flex', justifyContent: 'center' }}
                current={cancelledCurrentPage}
                pageSize={pageSize}
                total={cancelledPurchases.length}
                onChange={cancelledPageChangeHandler}
              />
            </div>
            <div style={{ border: '1px solid black' }}>
              <h1>지난 예약</h1>
              {completedPurchases.length === 0 ? (
                <h2 style={{ display: 'flex', justifyContent: 'center' }}>
                  결과없음
                </h2>
              ) : (
                displayCompletedPurchases.map((product, index) => (
                  <div style={{ border: '1px solid black' }} key={index}>
                    <h2>{product.product.title}</h2>
                    <Button
                      onClick={() =>
                        openVoucherModal(
                          product.detailId,
                          product.product.title,
                          product.product.description,
                          product.product.thumbnail,
                          product.reservation?.start,
                          product.reservation?.end
                        )
                      }
                    >
                      예약 확인증
                    </Button>
                    <div style={{ display: 'flex', height: '40px' }}>
                      <div style={{ width: '40%', border: '1px solid black' }}>
                        서울 강남구
                      </div>
                      <div
                        style={{
                          width: '60%',
                          border: '1px solid black',
                        }}
                      >
                        <span>
                          {product.reservation?.start.split('T')[0]} /{' '}
                          {
                            product.reservation?.start
                              .split('T')[1]
                              .split(':')[0]
                          }
                          시 ~{' '}
                          {product.reservation?.end.split('T')[1].split(':')[0]}
                          시
                        </span>
                      </div>
                    </div>
                    <VoucherModal
                      open={isOpenVoucher}
                      onCancel={closeVoucherModal}
                      detailId={voucherModalDetailId}
                      title={voucherModalTitle}
                      description={voucherModalDes}
                      img={voucherModalImg}
                      start={voucherModalSt}
                      end={voucherModalEn}
                    />
                  </div>
                ))
              )}
              <Pagination
                style={{ display: 'flex', justifyContent: 'center' }}
                current={completedCurrentPage}
                pageSize={pageSize}
                total={completedPurchases.length}
                onChange={completedPageChangeHandler}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPurchase;
