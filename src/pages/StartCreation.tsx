import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 开始创作页面 - 直接跳转到编辑器
const StartCreation: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 直接跳转到编辑器，默认固定时长模式
    navigate('/editor?durationMode=fixed', { replace: true });
  }, [navigate]);

  return null;
};

export default StartCreation;
