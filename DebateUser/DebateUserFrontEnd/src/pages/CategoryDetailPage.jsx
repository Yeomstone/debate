/**
 * CategoryDetailPage 컴포넌트
 *
 * 특정 카테고리의 토론 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * - 카테고리 정보 표시
 * - 해당 카테고리의 토론 목록 표시
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { debateService } from "../services/debateService";
import { categoryService } from "../services/categoryService";
import DebateCard from "../components/debate/DebateCard";
import "./CategoryDetailPage.css";

/**
 * CategoryDetailPage 컴포넌트
 *
 * @returns {JSX.Element} 카테고리 상세 페이지 컴포넌트
 */
const CategoryDetailPage = () => {
  // 훅 사용
  const { id } = useParams(); // URL 파라미터에서 카테고리 ID 가져오기

  // 상태 관리
  const [category, setCategory] = useState(null); // 카테고리 정보
  const [debates, setDebates] = useState([]); // 토론 목록
  const [loading, setLoading] = useState(true); // 로딩 상태

  /**
   * 카테고리 ID 변경 시 데이터 로딩
   */
  useEffect(() => {
    fetchData();
  }, [id]);

  /**
   * 데이터 가져오기
   *
   * 카테고리 정보와 해당 카테고리의 토론 목록을 병렬로 가져옵니다.
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      // 카테고리 정보와 토론 목록을 병렬로 가져오기
      const [categoryResponse, debatesResponse] = await Promise.all([
        categoryService.getCategoryById(id),
        debateService.getDebatesByCategory(id, 0, 20),
      ]);

      // ApiResponse 구조에서 data 추출
      setCategory(categoryResponse.data || categoryResponse);
      const debatesPageData = debatesResponse.data || debatesResponse;
      setDebates(debatesPageData.content || []);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">로딩 중...</div>;
  }

  if (!category) {
    return <div className="container">카테고리를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="category-detail-page">
      <div className="container">
        <div className="category-header">
          <h1>{category.name}</h1>
          {category.description && <p>{category.description}</p>}
        </div>
        <div className="debate-list">
          {debates.length === 0 ? (
            <div className="empty-state">
              <p>이 카테고리에 토론이 없습니다.</p>
            </div>
          ) : (
            debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
